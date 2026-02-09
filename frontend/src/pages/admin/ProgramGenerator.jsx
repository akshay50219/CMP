import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download,
  Preview,
  CalendarToday,
  Schedule,
  Place,
  People,
  FormatListNumbered,
  Refresh,
} from '@mui/icons-material';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';

const ProgramGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState([]);
  const [acceptedPapers, setAcceptedPapers] = useState([]);
  const [programSettings, setProgramSettings] = useState({
    conferenceName: 'International Conference on Computing',
    conferenceDate: new Date().toISOString().split('T')[0],
    venue: 'Main Conference Hall',
    sessionsPerDay: 4,
    minutesPerSession: 90,
    includeAbstracts: true,
    includeAuthors: true,
    includeSchedule: true,
    format: 'pdf',
  });
  const [schedule, setSchedule] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  useEffect(() => {
    fetchAcceptedPapers();
  }, []);

  const fetchAcceptedPapers = async () => {
    try {
      setLoading(true);
      const response = await paperService.getAllPapers({ status: 'accepted' });
      setPapers(response.data);
      setAcceptedPapers(response.data);
    } catch (error) {
      toast.error('Failed to load accepted papers');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = () => {
    if (acceptedPapers.length === 0) {
      toast.warning('No accepted papers to schedule');
      return;
    }

    const days = 3; // Default 3-day conference
    const sessionsPerDay = programSettings.sessionsPerDay;
    const totalSessions = days * sessionsPerDay;
    const papersPerSession = Math.ceil(acceptedPapers.length / totalSessions);
    
    const tracks = [...new Set(acceptedPapers.map(paper => paper.track))];
    
    const generatedSchedule = [];
    let paperIndex = 0;
    
    // Group papers by track first
    const papersByTrack = {};
    tracks.forEach(track => {
      papersByTrack[track] = acceptedPapers.filter(paper => paper.track === track);
    });
    
    // Create schedule
    for (let day = 1; day <= days; day++) {
      for (let session = 1; session <= sessionsPerDay; session++) {
        const sessionTime = calculateSessionTime(day, session);
        const sessionPapers = [];
        
        // Take papers from each track for parallel sessions
        tracks.forEach(track => {
          const trackPapers = papersByTrack[track];
          if (trackPapers && trackPapers.length > 0) {
            const paper = trackPapers.shift(); // Take one paper from each track
            if (paper) {
              sessionPapers.push({
                ...paper,
                sessionTime: `${sessionTime.start} - ${sessionTime.end}`,
                room: `Room ${session}`,
                chair: `Session Chair ${session}`,
              });
            }
          }
        });
        
        if (sessionPapers.length > 0) {
          generatedSchedule.push({
            day,
            session,
            time: `${sessionTime.start} - ${sessionTime.end}`,
            room: `Room ${session}`,
            papers: sessionPapers,
            chair: `Session Chair ${session}`,
          });
        }
      }
    }
    
    setSchedule(generatedSchedule);
    toast.success('Schedule generated successfully');
  };

  const calculateSessionTime = (day, session) => {
    const startHour = 9 + (session - 1) * 3; // 9 AM start, 3 hours per session
    const minutesPerSession = programSettings.minutesPerSession;
    
    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
    const endHour = startHour + Math.floor(minutesPerSession / 60);
    const endMinute = minutesPerSession % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    return { start: startTime, end: endTime };
  };

  const handleGenerateProgram = async () => {
    try {
      setLoading(true);
      const response = await paperService.generateConferenceProgram();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `conference-program-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Conference program downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate conference program');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setProgramSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading && papers.length === 0) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Conference Program Generator
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchAcceptedPapers}
          disabled={loading}
        >
          Refresh Papers
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Settings Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Program Settings
            </Typography>
            
            <TextField
              fullWidth
              label="Conference Name"
              value={programSettings.conferenceName}
              onChange={(e) => handleSettingChange('conferenceName', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Conference Date"
              type="date"
              value={programSettings.conferenceDate}
              onChange={(e) => handleSettingChange('conferenceDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Venue"
              value={programSettings.venue}
              onChange={(e) => handleSettingChange('venue', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Sessions per Day"
                  type="number"
                  value={programSettings.sessionsPerDay}
                  onChange={(e) => handleSettingChange('sessionsPerDay', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 8 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Minutes per Session"
                  type="number"
                  value={programSettings.minutesPerSession}
                  onChange={(e) => handleSettingChange('minutesPerSession', parseInt(e.target.value))}
                  inputProps={{ min: 30, max: 180, step: 15 }}
                />
              </Grid>
            </Grid>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Output Format</InputLabel>
              <Select
                value={programSettings.format}
                onChange={(e) => handleSettingChange('format', e.target.value)}
                label="Output Format"
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="html">HTML Web Page</MenuItem>
                <MenuItem value="csv">CSV Spreadsheet</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Include in Program:
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={programSettings.includeAbstracts}
                    onChange={(e) => handleSettingChange('includeAbstracts', e.target.checked)}
                  />
                }
                label="Paper Abstracts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={programSettings.includeAuthors}
                    onChange={(e) => handleSettingChange('includeAuthors', e.target.checked)}
                  />
                }
                label="Author Information"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={programSettings.includeSchedule}
                    onChange={(e) => handleSettingChange('includeSchedule', e.target.checked)}
                  />
                }
                label="Detailed Schedule"
              />
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              startIcon={<Schedule />}
              onClick={generateSchedule}
              disabled={acceptedPapers.length === 0}
              sx={{ mb: 2 }}
            >
              Generate Schedule
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Preview />}
              onClick={() => setPreviewDialogOpen(true)}
              disabled={schedule.length === 0}
              sx={{ mb: 2 }}
            >
              Preview Program
            </Button>
            
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={handleGenerateProgram}
              disabled={schedule.length === 0 || loading}
              color="success"
            >
              {loading ? 'Generating...' : 'Download Program'}
            </Button>
          </Paper>
        </Grid>

        {/* Statistics and Preview */}
        <Grid item xs={12} md={8}>
          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <FormatListNumbered sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4">{acceptedPapers.length}</Typography>
                  <Typography variant="body2">Accepted Papers</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CalendarToday sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4">3</Typography>
                  <Typography variant="body2">Conference Days</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4">{programSettings.sessionsPerDay * 3}</Typography>
                  <Typography variant="body2">Total Sessions</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4">
                    {[...new Set(acceptedPapers.flatMap(p => p.authors))].length}
                  </Typography>
                  <Typography variant="body2">Unique Authors</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Accepted Papers List */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Accepted Papers ({acceptedPapers.length})
            </Typography>
            
            {acceptedPapers.length === 0 ? (
              <Alert severity="info">
                No accepted papers yet. Papers must be accepted to appear in the conference program.
              </Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Track</TableCell>
                      <TableCell>Authors</TableCell>
                      <TableCell>Session</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {acceptedPapers.slice(0, 10).map((paper, index) => {
                      const sessionInfo = schedule.flatMap(s => s.papers).find(p => p._id === paper._id);
                      return (
                        <TableRow key={paper._id} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {paper.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={paper.track} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {paper.authors?.slice(0, 2).join(', ')}
                              {paper.authors?.length > 2 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {sessionInfo ? (
                              <Chip 
                                label={`Day ${sessionInfo.day}, Session ${sessionInfo.session}`} 
                                size="small" 
                                color="primary"
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Not scheduled
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Generated Schedule Preview */}
          {schedule.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generated Schedule Preview
              </Typography>
              
              {schedule.map((daySchedule, dayIndex) => (
                <Box key={dayIndex} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    p: 1, 
                    borderRadius: 1 
                  }}>
                    Day {daySchedule.day} - {programSettings.conferenceDate}
                  </Typography>
                  
                  {schedule
                    .filter(s => s.day === daySchedule.day)
                    .map((session, sessionIndex) => (
                      <Card key={sessionIndex} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle1">
                                Session {session.session}: {session.time}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {session.room} • Chair: {session.chair}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${session.papers.length} papers`} 
                              size="small" 
                              color="primary"
                            />
                          </Box>
                          
                          <Box sx={{ pl: 2 }}>
                            {session.papers.map((paper, paperIndex) => (
                              <Box key={paperIndex} sx={{ mb: 2, pb: 2, borderBottom: paperIndex < session.papers.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {paper.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {paper.authors?.join(', ')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <Chip label={paper.track} size="small" />
                                  <Chip label={`${paper.time || session.time}`} size="small" variant="outlined" />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        maxHeight="80vh"
      >
        <DialogTitle>
          Program Preview
          <Typography variant="subtitle2" color="text.secondary">
            {programSettings.conferenceName}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2 }}>
            {/* Conference Header */}
            <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid', borderColor: 'primary.main', pb: 2 }}>
              <Typography variant="h4" gutterBottom>
                {programSettings.conferenceName}
              </Typography>
              <Typography variant="h6" gutterBottom color="primary">
                Conference Program
              </Typography>
              <Typography variant="body1">
                {new Date(programSettings.conferenceDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <Typography variant="body1">
                {programSettings.venue}
              </Typography>
            </Box>

            {/* Schedule */}
            {schedule.map((daySchedule, dayIndex) => (
              <Box key={dayIndex} sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: 'primary.main',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1,
                  mb: 3
                }}>
                  Day {daySchedule.day}
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Session</TableCell>
                        <TableCell>Chair</TableCell>
                        <TableCell>Papers</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schedule
                        .filter(s => s.day === daySchedule.day)
                        .map((session, sessionIndex) => (
                          <TableRow key={sessionIndex}>
                            <TableCell>{session.time}</TableCell>
                            <TableCell>{session.room}</TableCell>
                            <TableCell>Session {session.session}</TableCell>
                            <TableCell>{session.chair}</TableCell>
                            <TableCell>
                              <Box>
                                {session.papers.map((paper, paperIndex) => (
                                  <Box key={paperIndex} sx={{ mb: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      {paper.title}
                                    </Typography>
                                    {programSettings.includeAuthors && (
                                      <Typography variant="caption" color="text.secondary">
                                        {paper.authors?.join(', ')}
                                      </Typography>
                                    )}
                                    {programSettings.includeAbstracts && paper.abstract && (
                                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                        {paper.abstract.substring(0, 100)}...
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleGenerateProgram}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Download Program'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramGenerator;