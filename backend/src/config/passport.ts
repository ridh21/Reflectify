import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma';
import { Profile } from 'passport-google-oauth20';

passport.serializeUser((user: any, done) => {
  done(null, user.id || user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
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

        const user = await prisma.user.upsert({
          where: { email: profile.emails[0].value },
          create: {
            email: profile.emails[0].value,
            name: profile.displayName || profile.emails[0].value.split('@')[0],
            role: 'USER',
            password: '',
            picture: profile.photos?.[0]?.value || '',
            googleId: profile.id,
          },
          update: {
            name: profile.displayName || profile.emails[0].value.split('@')[0],
            picture: profile.photos?.[0]?.value || '',
          },
        });

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export default passport;
