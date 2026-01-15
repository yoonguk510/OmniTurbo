import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ORPCError } from '@orpc/nest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@repo/database';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@repo/database';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaClient,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
        this.configService.get<string>('GOOGLE_CLIENT_ID'),
        this.configService.get<string>('GOOGLE_CLIENT_SECRET')
    );
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    if (!user.emailVerified) {
        throw new ORPCError('FORBIDDEN', {
            message: 'Email not verified',
        });
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async verifyGoogleToken(token: string) {
    try {
        let idToken = token;
        if (!token.includes('.')) {
             const { tokens } = await this.googleClient.getToken({
                code: token,
                redirect_uri: 'postmessage', // @react-oauth/google popup flow uses this
             });
             if (!tokens.id_token) {
                 throw new UnauthorizedException('No ID Token in response');
             }
             idToken = tokens.id_token;
        }

        const ticket = await this.googleClient.verifyIdToken({
            idToken: idToken,
            audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            throw new UnauthorizedException('Invalid Google Token');
        }
        return { 
            email: payload.email, 
            sub: payload.sub, 
            name: payload.name, 
            picture: payload.picture 
        };
    } catch (error) {
        console.log(error);
        throw new UnauthorizedException('Invalid Google Token');
    }
  }

  async findOrCreateGoogleUser(payload: { email: string; sub: string; name?: string; picture?: string }) {
     let user = await this.prisma.user.findUnique({ where: { email: payload.email } });
     
     if (!user) {
       user = await this.prisma.user.create({
         data: {
           email: payload.email,
           name: payload.name,
           image: payload.picture,
           emailVerified: new Date(),
           accounts: {
             create: {
               type: 'oauth',
               provider: 'google',
               providerAccountId: payload.sub,
             }
           }
         }
       });
     } else {
        // Ensure account link exists
        const account = await this.prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: payload.sub
                }
            }
        });
        if (!account) {
            await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: 'google',
                    providerAccountId: payload.sub
                }
            });
        }
     }
     
     const { password: _password, ...result } = user;
     return result;
  }

  async register(input: { email: string; password?: string; name?: string | null }) {
    const hashedPassword = input.password ? await bcrypt.hash(input.password, 10) : undefined;
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
    });
    
    // Generate verification token
    const token = Math.random().toString(36).substring(2, 15);
    await this.prisma.verificationToken.create({
        data: {
            identifier: user.email,
            token,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    });

    await this.emailService.sendVerificationEmail(user.email, token);

    return user;
  }
  
  async forgotPassword(email: string) {
      const user = await this.prisma.user.findUnique({ where: { email }});
      if (!user) return; // Silent fail

      const token = Math.random().toString(36).substring(2, 15);
      // Invalidate existing tokens
      await this.prisma.verificationToken.deleteMany({ where: { identifier: email } });

      await this.prisma.verificationToken.create({
          data: {
              identifier: email,
              token,
              expires: new Date(Date.now() + 3600000)
          } 
      });
       
      await this.emailService.sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string) {
      const verificationToken = await this.prisma.verificationToken.findFirst({
          where: { token },
      });

      if (!verificationToken || new Date() > verificationToken.expires) {
           if (verificationToken) {
               await this.prisma.verificationToken.delete({ where: { identifier_token: { identifier: verificationToken.identifier, token } } });
           }
           throw new ORPCError('BAD_REQUEST', {
              message: 'Invalid or expired token',
          });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
          where: { email: verificationToken.identifier },
          data: { password: hashedPassword },
      });

      await this.prisma.verificationToken.delete({
          where: { identifier_token: { identifier: verificationToken.identifier, token } },
      });
  }
  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.verificationToken.findFirst({
        where: { token },
    });

    if (!verificationToken) {
        throw new ORPCError('BAD_REQUEST', {
            message: 'Invalid or expired token',
        });
    }
    
    // Check expiry if needed (currently model has expires field)
    if (new Date() > verificationToken.expires) {
         await this.prisma.verificationToken.delete({ where: { identifier_token: { identifier: verificationToken.identifier, token: token }}});
         throw new ORPCError('BAD_REQUEST', {
            message: 'Invalid or expired token',
        });
    }

    const user = await this.prisma.user.findUnique({ where: { email: verificationToken.identifier } });
    if (user) {
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
        });
    }

    await this.prisma.verificationToken.delete({
        where: { identifier_token: { identifier: verificationToken.identifier, token: token } },
    });
  }

  async refresh(oldRefreshToken: string) {
     try {
       const payload = this.jwtService.verify(oldRefreshToken);
       // Check if session exists and is valid
       const session = await this.prisma.session.findUnique({
           where: { sessionToken: oldRefreshToken },
           include: { user: true }
       });

       if (!session || session.expires < new Date()) {
           throw new UnauthorizedException('Invalid refresh token');
       }
       
       const user = session.user;
       const newPayload = { email: user.email, sub: user.id, role: user.role };
       const accessToken = this.jwtService.sign(newPayload);
       const refreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
       
       // Update session
       await this.prisma.session.update({
           where: { id: session.id },
           data: {
               sessionToken: refreshToken,
               expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
           }
       });

       return {
           accessToken,
           refreshToken,
           user: {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.image,
              role: user.role as UserRole,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
           }
       };

     } catch (e) {
         throw new UnauthorizedException('Invalid refresh token');
     }
  }
}
