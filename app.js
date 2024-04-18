const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const mongoDBConnectionString = 'mongodb://localhost:27017';

app.use(bodyParser.json());

mongoose.connect(mongoDBConnectionString)
    .then(() => {
        console.log('Connected to MongoDB');

        // انشاء قاعدة بيانات جديدة بعد الاتصال وتسميتها "sms"
        mongoose.connection.db.admin().listDatabases((err, result) => {
            if (err) {
                console.error('Error creating database:', err);
                return;
            }
            if (!result.databases.some(db => db.name === 'sms')) {
                mongoose.connection.db.admin().createDatabase('sms', (err, result) => {
                    if (err) {
                        console.error('Error creating database:', err);
                        return;
                    }
                    console.log('Database "sms" created successfully!');
                    // إنشاء مجموعة البيانات "messages" بعد إنشاء قاعدة البيانات "sms"
                    mongoose.connection.db.createCollection('messages', (err, result) => {
                        if (err) {
                            console.error('Error creating collection:', err);
                            return;
                        }
                        console.log('Collection "messages" created successfully!');
                    });
                });
            }
        });
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));

const messageSchema = new mongoose.Schema({
    content: String
});

const Message = mongoose.model('Message', messageSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/messages', (req, res) => {
    const newMessage = new Message({ content: req.body.content });
    newMessage.save()
        .then(() => {
            console.log('Message saved successfully!');
            res.status(201).json({ message: 'Message created successfully!' });
        })
        .catch(err => {
            console.error('Error saving message:', err);
            res.status(500).json({ message: 'Error creating message' });
        });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
