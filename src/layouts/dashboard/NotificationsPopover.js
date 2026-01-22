import PropTypes from "prop-types";
// import { noCase } from "change-case";
import { useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Icon } from "@iconify/react";
import bellFill from "@iconify/icons-eva/bell-fill";
import clockFill from "@iconify/icons-eva/clock-fill";
import doneAllFill from "@iconify/icons-eva/done-all-fill";
import trashFill from "@iconify/icons-eva/trash-2-fill";
// material
import { alpha } from "@mui/material/styles";
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  IconButton,
  Typography,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
  CircularProgress,
} from "@mui/material";
// hooks
import useNotifications from "../../hooks/useNotifications";
// components
import Scrollbar from "../../components/Scrollbar";
import MenuPopover from "../../components/MenuPopover";

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

function getNotificationIcon(type) {
  const iconMap = {
    order_placed: "/static/icons/ic_notification_package.svg",
    order_shipped: "/static/icons/ic_notification_shipping.svg",
    order_completed: "/static/icons/ic_notification_package.svg",
    order_cancelled: "/static/icons/ic_notification_package.svg",
    ticket_created: "/static/icons/ic_notification_chat.svg",
    ticket_updated: "/static/icons/ic_notification_chat.svg",
    ticket_closed: "/static/icons/ic_notification_chat.svg",
    course_booked: "/static/icons/ic_notification_package.svg",
    course_reminder: "/static/icons/ic_notification_package.svg",
    test_scheduled: "/static/icons/ic_notification_package.svg",
    test_reminder: "/static/icons/ic_notification_package.svg",
    payment_received: "/static/icons/ic_notification_package.svg",
    payment_failed: "/static/icons/ic_notification_package.svg",
    message_received: "/static/icons/ic_notification_chat.svg",
    chat_assigned: "/static/icons/ic_notification_chat.svg",
    default: "/static/icons/ic_notification_mail.svg"
  };
  
  return iconMap[type] || iconMap.default;
}

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      {notification.message && (
        <Typography
          component="span"
          variant="body2"
          sx={{ color: "text.secondary" }}
        >
          &nbsp; {notification.message}
        </Typography>
      )}
    </Typography>
  );

  return {
    avatar: notification.avatar ? (
      <img alt={notification.title} src={notification.avatar} />
    ) : (
      <img alt={notification.title} src={getNotificationIcon(notification.type)} />
    ),
    title,
  };
}

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired,
  onRead: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};

function NotificationItem({ notification, onRead, onDelete, onClick }) {
  const { avatar, title } = renderContent(notification);

  const handleClick = () => {
    if (!notification.read && onRead) {
      onRead(notification._id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification._id);
    }
  };

  return (
    <ListItemButton
      onClick={handleClick}
      disableGutters
      sx={{
        py: 1.5,
        px: 2.5,
        mt: "1px",
        position: 'relative',
        ...(!notification.read && {
          bgcolor: "action.selected",
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: "background.neutral" }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              color: "text.disabled",
            }}
          >
            <Box
              component={Icon}
              icon={clockFill}
              sx={{ mr: 0.5, width: 16, height: 16 }}
            />
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </Typography>
        }
      />
      <IconButton
        size="small"
        onClick={handleDelete}
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.6,
          '&:hover': { opacity: 1 }
        }}
      >
        <Icon icon={trashFill} width={16} height={16} />
      </IconButton>
    </ListItemButton>
  );
}

export default function NotificationsPopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  // Use our custom notifications hook
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    handleClose();
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Separate unread and read notifications
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <>
      <IconButton
        ref={anchorRef}
        size="large"
        color={open ? "primary" : "default"}
        onClick={handleOpen}
        sx={{
          ...(open && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.focusOpacity
              ),
          }),
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Icon icon={bellFill} width={20} height={20} />
        </Badge>
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 360 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {unreadCount > 0 
                ? `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                : 'No unread notifications'}
            </Typography>
          </Box>

          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Icon icon={doneAllFill} width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <Scrollbar sx={{ height: { xs: 340, sm: 'auto' }, maxHeight: 480 }}>
            {unreadNotifications.length > 0 && (
              <List
                disablePadding
                subheader={
                  <ListSubheader
                    disableSticky
                    sx={{ py: 1, px: 2.5, typography: "overline" }}
                  >
                    New
                  </ListSubheader>
                }
              >
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onRead={handleRead}
                    onDelete={handleDelete}
                    onClick={handleNotificationClick}
                  />
                ))}
              </List>
            )}

            {readNotifications.length > 0 && (
              <List
                disablePadding
                subheader={
                  <ListSubheader
                    disableSticky
                    sx={{ py: 1, px: 2.5, typography: "overline" }}
                  >
                    Earlier
                  </ListSubheader>
                }
              >
                {readNotifications.slice(0, 5).map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onRead={handleRead}
                    onDelete={handleDelete}
                    onClick={handleNotificationClick}
                  />
                ))}
              </List>
            )}
          </Scrollbar>
        )}

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button 
            fullWidth 
            disableRipple 
            component={RouterLink} 
            to="/dashboard/notifications"
          >
            View All
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
