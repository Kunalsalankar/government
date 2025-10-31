import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

const ShareButton = ({ districtName, stateName }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  const shareUrl = window.location.href;
  const shareText = `Check out ${districtName}, ${stateName}'s MGNREGA performance on Our Voice, Our Rights`;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbar({ open: true, message: 'Link copied to clipboard!' });
      handleClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to copy link' });
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
    handleClose();
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    handleClose();
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    handleClose();
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MGNREGA Information',
          text: shareText,
          url: shareUrl
        });
        handleClose();
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <>
      <Tooltip title="Share">
        <IconButton onClick={handleClick} color="primary">
          <ShareIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {navigator.share && (
          <MenuItem onClick={nativeShare}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={copyToClipboard}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={shareToWhatsApp}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={shareToFacebook}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={shareToTwitter}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareButton;
