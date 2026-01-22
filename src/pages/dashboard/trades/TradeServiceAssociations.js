import React, { useState, useCallback, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, Snackbar, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { salesService } from '../../../services/sales.service';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

export default function TradeServiceAssociations() {
  const [trades, setTrades] = useState([]);
  const [cards, setCards] = useState([]);
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching initial data...');
      
      // Fetch trades first
      const tradesResponse = await salesService.getTrades();
      console.log('Raw trades response:', tradesResponse);
      
      // Handle trades response
      const tradesData = Array.isArray(tradesResponse) ? tradesResponse :
                        tradesResponse?.success ? tradesResponse.data :
                        tradesResponse?.data ? tradesResponse.data : [];
      console.log('Processed trades data:', tradesData);
      setTrades(tradesData);

      // Fetch all services
      const [cardsResp, testsResp, coursesResp, qualificationsResp] = await Promise.all([
        salesService.getCards(),
        salesService.getTests(),
        salesService.getCourses(),
        salesService.getQualifications()
      ]);
      
      console.log('Services responses:', {
        cards: cardsResp,
        tests: testsResp,
        courses: coursesResp,
        qualifications: qualificationsResp
      });

      // Set services data
      if (cardsResp?.success) setCards(cardsResp.data || []);
      if (testsResp?.success) setTests(testsResp.data || []);
      if (coursesResp?.success) setCourses(coursesResp.data || []);
      if (qualificationsResp?.success) setQualifications(qualificationsResp.data || []);

      // Fetch associations after we have trades and services
      console.log('Fetching associations...');
      const associationsResp = await salesService.getTradeServiceAssociations();
      console.log('Raw associations response:', associationsResp);
      
      // Handle associations response
      const associationsData = Array.isArray(associationsResp) ? associationsResp :
                             associationsResp?.success ? associationsResp.data :
                             associationsResp?.data ? associationsResp.data : [];
      console.log('Processed associations data:', associationsData);
      setAssociations(associationsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showSnackbar(error.message || 'Error fetching data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSaveAssociation = async () => {
    if (!selectedTrade) {
      showSnackbar('Please select a trade', 'error');
      return;
    }

    setLoading(true);
    try {
      const associationData = {
        trade: selectedTrade._id,
        cards: selectedCards.map(card => card._id),
        tests: selectedTests.map(test => test._id),
        courses: selectedCourses.map(course => course._id),
        qualifications: selectedQualifications.map(qual => qual._id)
      };

      console.log('Creating association with data:', associationData);
      const response = await salesService.createTradeServiceAssociation(associationData);
      console.log('Create association response:', response);
      
      showSnackbar('Association saved successfully', 'success');
      await fetchInitialData();
      resetSelections();
    } catch (error) {
      console.error('Error saving association:', error);
      showSnackbar(error.message || 'Error saving association. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssociation = async (associationId) => {
    try {
      setLoading(true);
      await salesService.deleteTradeServiceAssociation(associationId);
      showSnackbar('Association deleted successfully', 'success');
      await fetchInitialData();
    } catch (error) {
      console.error('Error deleting association:', error);
      showSnackbar(error.message || 'Error deleting association', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetSelections = () => {
    setSelectedTrade(null);
    setSelectedCards([]);
    setSelectedTests([]);
    setSelectedCourses([]);
    setSelectedQualifications([]);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isOptionEqualToValue = (option, value) => {
    if (!option || !value) return false;
    return option._id === value._id;
  };

  if (loading && !trades.length) {
    return (
      <Container style={{ textAlign: 'center', padding: '40px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Trade-Service Associations
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Autocomplete
          value={selectedTrade}
          onChange={(event, newValue) => {
            setSelectedTrade(newValue);
          }}
          options={trades}
          getOptionLabel={(option) => option?.title || ''}
          isOptionEqualToValue={isOptionEqualToValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Trade"
              variant="outlined"
              fullWidth
              required
            />
          )}
        />

        <div style={{ marginTop: '20px' }}>
          <Autocomplete
            multiple
            value={selectedCards}
            onChange={(event, newValue) => {
              setSelectedCards(newValue);
            }}
            options={cards}
            getOptionLabel={(option) => option?.title || ''}
            isOptionEqualToValue={isOptionEqualToValue}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option._id}
                  label={option.title}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Cards"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />

          <Autocomplete
            multiple
            value={selectedTests}
            onChange={(event, newValue) => {
              setSelectedTests(newValue);
            }}
            options={tests}
            getOptionLabel={(option) => option?.title || ''}
            isOptionEqualToValue={isOptionEqualToValue}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option._id}
                  label={option.title}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Tests"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />

          <Autocomplete
            multiple
            value={selectedCourses}
            onChange={(event, newValue) => {
              setSelectedCourses(newValue);
            }}
            options={courses}
            getOptionLabel={(option) => option?.title || ''}
            isOptionEqualToValue={isOptionEqualToValue}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option._id}
                  label={option.title}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Courses"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />

          <Autocomplete
            multiple
            value={selectedQualifications}
            onChange={(event, newValue) => {
              setSelectedQualifications(newValue);
            }}
            options={qualifications}
            getOptionLabel={(option) => option?.title || ''}
            isOptionEqualToValue={isOptionEqualToValue}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option._id}
                  label={option.title}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Qualifications (Auto-synced)"
                variant="outlined"
                fullWidth
                margin="normal"
                helperText="Qualifications are automatically linked when created/edited"
              />
            )}
          />
        </div>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveAssociation}
          disabled={loading || !selectedTrade}
          style={{ marginTop: '20px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Association'}
        </Button>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trade</TableCell>
              <TableCell>Cards</TableCell>
              <TableCell>Tests</TableCell>
              <TableCell>Courses</TableCell>
              <TableCell>Qualifications</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {associations.map((association) => (
              <TableRow key={association._id}>
                <TableCell>
                  {trades.find(t => t._id === (typeof association.trade === 'string' ? association.trade : association.trade?._id))?.title || 
                   association.trade?.title || 'Unknown Trade'}
                </TableCell>
                <TableCell>
                  {(association.cards || []).map(cardId => 
                    cards.find(c => c._id === (typeof cardId === 'string' ? cardId : cardId._id))?.title
                  ).filter(Boolean).join(', ')}
                </TableCell>
                <TableCell>
                  {(association.tests || []).map(testId => 
                    tests.find(t => t._id === (typeof testId === 'string' ? testId : testId._id))?.title
                  ).filter(Boolean).join(', ')}
                </TableCell>
                <TableCell>
                  {(association.courses || []).map(courseId => 
                    courses.find(c => c._id === (typeof courseId === 'string' ? courseId : courseId._id))?.title
                  ).filter(Boolean).join(', ')}
                </TableCell>
                <TableCell>
                  {(association.qualifications || []).map(qualId => 
                    qualifications.find(q => q._id === (typeof qualId === 'string' ? qualId : qualId._id))?.title
                  ).filter(Boolean).join(', ') || <em style={{color: '#888'}}>Auto-synced</em>}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleDeleteAssociation(association._id)}
                    color="error"
                    title="Delete Association"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!associations.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No associations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}