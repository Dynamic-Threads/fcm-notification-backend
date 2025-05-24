const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Initialize Firebase Admin SDK with your service account JSON
const serviceAccount = require('./serviceAccountKey.json'); // get this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post('/send-notice', async (req, res) => {
  const { title, postedBy, driveLink, timestamp } = req.body;

  if (!title || !postedBy) {
    return res.status(400).send('Missing required fields');
  }

  const payload = {
    notification: {
      title: `New Notice: ${title}`,
      body: `Posted by: ${postedBy}`,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    data: {
      driveLink: driveLink || '',
      timestamp: timestamp || '',
    },
  };

  try {
    const response = await admin.messaging().sendToTopic('notices', payload);
    console.log('Notification sent:', response);
    res.status(200).send('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Error sending notification');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
