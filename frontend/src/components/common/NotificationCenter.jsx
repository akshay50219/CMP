import { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Notifications,
  CheckCircle,
  Warning,
  Error,
  Info,
  Assignment,
  RateReview,
  Description,
  Schedule,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications - replace with real API calls
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'assignment',
        title: 'New Paper Assigned',
        message: 'You have been assigned to review "Machine Learning Approaches"',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: false,
        icon: <Assignment color="primary" />,
        color: 'primary',
      },
      {
        id: 2,
        type: 'deadline',
        title: 'Review Deadline Approaching',
        message: 'Review for "Data Science Methods" is due in 2 days',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: false,
        icon: <Schedule color="warning" />,
        color: 'warning',
      },
      {
        id: 3,
        type: 'submission',
        title: 'Paper Submitted',
        message: 'Your paper "AI in Healthcare" has been submitted successfully',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        read: true,
        icon: <Description color="success" />,
        color: 'success',
      },
      {
        id: 4,
        type: 'review',
        title: 'Review Completed',
        message: 'Review for "Computer Vision Techniques" has been submitted',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        read: true,
        icon: <RateReview color="info" />,
        color: 'info',
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <Info color="info" />;
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
          '& .MuiPopover-paper': {
            width: 360,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary="You're all caught up!"
                />
              </ListItem>
            ) : (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <ListItemIcon>
                    {notification.icon || getSeverityIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: `${notification.color}.main`,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItem>
              ))
            )}
          </List>

          {notifications.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button size="small" variant="text">
                View all notifications
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationCenter;