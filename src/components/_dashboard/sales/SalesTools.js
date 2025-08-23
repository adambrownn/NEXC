import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Button,
  Stack,
  Typography,
  Divider
} from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function SalesTools() {
  const [note, setNote] = useState('');
  const [reminder, setReminder] = useState('');
  const [notes, setNotes] = useState([]); // Will store sales notes
  const [reminders, setReminders] = useState([]); // Will store reminders

  const handleAddNote = () => {
    if (note.trim()) {
      setNotes([
        { id: Date.now(), content: note, timestamp: new Date() },
        ...notes
      ]);
      setNote('');
    }
  };

  const handleAddReminder = () => {
    if (reminder.trim()) {
      setReminders([
        { id: Date.now(), content: reminder, timestamp: new Date() },
        ...reminders
      ]);
      setReminder('');
    }
  };

  return (
    <Card>
      <CardHeader title="Sales Tools" subheader="Notes and Reminders" />
      <CardContent>
        <Stack spacing={3}>
          {/* Notes Section */}
          <div>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Quick Notes
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
              />
              <Button
                variant="contained"
                onClick={handleAddNote}
                startIcon={<NotesIcon />}
              >
                Add
              </Button>
            </Stack>
            <List>
              {notes.map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.content}
                    secondary={new Date(item.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </div>

          <Divider />

          {/* Reminders Section */}
          <div>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Reminders
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                placeholder="Add a reminder..."
              />
              <Button
                variant="contained"
                onClick={handleAddReminder}
                startIcon={<EventNoteIcon />}
              >
                Add
              </Button>
            </Stack>
            <List>
              {reminders.map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    <EventNoteIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.content}
                    secondary={new Date(item.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
