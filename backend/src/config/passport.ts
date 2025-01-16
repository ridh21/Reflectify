import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma';
import { Profile } from 'passport-google-oauth20';
import { Admin } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends Admin {
      role: string;
      picture: string;
      googleId: string;
    }
  }
}

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });
    if (admin) {
      const user: Express.User = {
        ...admin,
        role: 'ADMIN',
        picture: '',
        googleId: id
      };
      done(null, user);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:4000/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        if (!profile.emails?.[0]?.value || !profile.id) {
          throw new Error('Insufficient profile information from Google');
        }

        const admin = await prisma.admin.upsert({
          where: { email: profile.emails[0].value },
          create: {
            email: profile.emails[0].value,
            name: profile.displayName || profile.emails[0].value.split('@')[0],
            designation: 'Google Auth User',
            password: '',
            isSuper: false
          },
          update: {
            name: profile.displayName || profile.emails[0].value.split('@')[0],
          },
        });

        const user: Express.User = {
          ...admin,
          role: 'ADMIN',
          picture: profile.photos?.[0]?.value || '',
          googleId: profile.id
        };

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export default passport;
