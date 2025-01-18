import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard');
  }
);

router.get('/status', (req, res) => {
  res.json({ authenticated: false });
});

// router.get('/status', (req, res) => {
//   console.log('Session:', req.session);
//   console.log('User:', req.user);
//   if (req.isAuthenticated()) {
//     res.json({
//       user: {
//         name: req.user.name,
//         picture: req.user.picture,
//         email: req.user.email
//       }
//     });
//   } else {
//     res.json({ user: null });
//   }
// });

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000');
  });
});

export default router;
