const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// 🔐 Decode base64 service account key
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString('utf8')
);

// ✅ Initialize Firebase Admin SDK with projectId
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id, // 🔑 important for HTTP v1
});

app.post('/send-notice', async (req, res) => {
  const { title, postedBy, driveLink, timestamp } = req.body;

  if (!title || !postedBy) {
    return res.status(400).send('Missing required fields');
  }

  const message = {
    notification: {
      title: `New Update: ${title}`,
      body: `Posted by: ${postedBy}`,
    },
    data: {
      driveLink: driveLink || '',
      timestamp: timestamp || '',
    },
    topic: 'notices', // topic-based message
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    res.status(200).send('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Error sending notification');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
