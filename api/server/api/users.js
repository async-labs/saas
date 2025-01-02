const express = require('express');
const admin = require('../firebaseAdmin');

const router = express.Router();

router.get('/:uid', async (req, res) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.params.uid).get();
    if (!userDoc.exists) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(userDoc.data());
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;