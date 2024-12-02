import React, { useState } from "react";
import "./navbar.css";
import logo from "./peerImageResized.png";
import Search from "./Search";
import { Link, NavLink } from "react-router-dom";
import { bellOutline, exploreFill, homeFill, messageFill, messageOutline, profileIcon, savedIcon, settingsIcon, switchAccountIcon } from "../../assets/svgIcons";
import { exploreOutline } from "../../assets/svgIcons";
import { postUploadOutline } from "../../assets/svgIcons";
import { likeOutline } from "../../assets/svgIcons";
import { homeOutline } from "../../assets/svgIcons";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../../context/Auth";
import { url } from "../../baseUrl";
import { api } from "../../Interceptor/apiCall";
import defaultImg from '../../assets/dafault.png'
import { NotificationBox } from "../dialog/NotificationBox";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from '../../firebase';


export const Navbar = ({ active }) => {

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [imgurl, setImgurl] = useState('')
  const context = useContext(AuthContext)
  const [caption, setCaption] = useState('')
  const [innerActive, setInnerActive] = useState()

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorElNot, setAnchorElNot] = React.useState(null);
  const openNot = Boolean(anchorElNot);
  const handleClickNot = (event) => {
    setInnerActive("notification")
    setAnchorElNot(event.currentTarget);
  };
  const handleCloseNot = () => {
    setAnchorElNot(null);
    setInnerActive()
  };

  const [openDailog, setOpenDilaog] = React.useState(false);

  const handleClickOpen = () => {
    setInnerActive("newpost")
    setOpenDilaog(true);
  };

  const handleCloseDialog = () => {
    setImgurl('')
    setCaption('')
    setOpenDilaog(false);
    setInnerActive()
  };

  const logout = async () => {
    api.post(`${url}/auth/logout`, {
      token: localStorage.getItem('refresh_token')
    }).then((resp) => {
      if (resp.data) {
        localStorage.clear()
        window.location.reload()
        context.setAuth(null)
      }
    }).catch((err) => {

    })
  }
  context.logout = logout

  const upload = async (e) => {
    const file = e.target.files[0]
    if (!(file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      context.throwErr("Filt type not supported")
    }
    const storageRef = ref(storage, 'images/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.log(error);
        context.throwErr("Some error occured")
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgurl(downloadURL)
        });
      }
    );
  }
  const handlePost = async () => {
    if (!caption) {
      return context.throwErr("Caption Required")
    }
    const data = {
      caption: caption,
      files: [{
        fileType: "image",
        link: imgurl
      }]
    }
    api.post(`${url}/post/create`, data).then((res) => {
      if (res.data) {
        context.throwSuccess("Posted")
        handleCloseDialog()
        context.newpost(res.data)
      }
      console.log(res.data);
    })
  }


  return (
    <div className="navbar flex">
      <div className="width60 nav flex flex-row justify-btwn">
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/"><img src={logo} style={{ marginBottom: '0px' }} alt="" /></Link>
        </div>
        <div className="searchbar">
          <Search />
        </div>
        <div className="icons">
          <NavLink to="/" >{(active === "home" && !innerActive) ? homeFill : homeOutline}</NavLink>
          <Link to="/chats/all">{(active === "chat" && !innerActive) ? messageFill : messageOutline}</Link>

          <button onClick={handleClickOpen} className="no-style " >{innerActive === "newpost" ?
            <svg aria-label="New post" className="_ab6-" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M12 2l6 6h-4v6h-4V8H6l6-6zM3 18h18v2H3z"></path></svg>
            :
            postUploadOutline}</button>
          <Dialog
            maxWidth="lg"
            open={openDailog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              style: {
                borderRadius: '15px'
              }
            }}
          >
            <DialogTitle style={{ fontFamily: 'Poppins', textAlign: 'center', fontSize: '15.5px' }} id="alert-dialog-title">
              {"Create new post"}
            </DialogTitle>
            <Divider style={{ marginTop: '-10px' }} />
            <DialogContent style={{}}>
              <div className="post" style={{ width: '45vw', height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>

                {
                  imgurl ?
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <div className="imageup" style={{ height: '65%' }}>
                        <img style={{ width: '95%', height: '100%', margin: 'auto' }} src={imgurl} alt="" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', width: '80%', position: 'absolute', bottom: 15, margin: 'auto' }}>
                        <TextField
                          id="outlined-multiline-static"
                          label="Caption"
                          multiline
                          rows={4}
                          InputProps={{
                            style: { fontSize: '13.5px', fontFamily: 'Poppins' }
                          }}
                          value={caption} onChange={e => setCaption(e.target.value)}
                        />
                        <button onClick={() => handlePost()} style={{ border: 'none', outline: 'none', background: 'blue', padding: '3.5px 9px', borderRadius: '5px', color: 'white', backgroundColor: '#2196f3', marginTop: '12px', fontSize: '15px', cursor: 'pointer' }}>Upload</button>
                      </div>
                    </div> :
                    <>
                      <svg style={{ marginBottom: '10px' }} aria-label="Icon to represent media such as images or videos" color="#262626" fill="#262626" height="77" role="img" viewBox="0 0 96 96" width="96"><path d="M48 12l-12 12h8v36h8V24h8L48 12zM16 76h64v8H16z"></path></svg>
                      <p style={{ fontSize: '15px' }}>Drag photos and videos here</p>
                      <label htmlFor="imgHandleUp" style={{ border: 'none', outline: 'none', background: 'blue', padding: '3.5px 9px', borderRadius: '5px', color: 'white', backgroundColor: '#2196f3', marginTop: '12px', fontSize: '15px', cursor: 'pointer' }}>Select from computer</label>
                      <input onChange={e => upload(e)} id="imgHandleUp" type="file" multiple hidden />
                    </>
                }

              </div>
            </DialogContent>

          </Dialog>


          <Menu
            anchorEl={anchorElNot}
            id="account-menu"
            open={openNot}
            onClick={handleCloseNot}
            onClose={handleCloseNot}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                width: '470px',
                minHeight: '30px',
                maxHeight: '400px',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <div style={{ minHeight: '150px', maxHeight: '390px', display: 'flex', flexDirection: 'column', overflowY: 'scroll', }}>

              {
                <NotificationBox />
              }

            </div>

          </Menu>

          <NavLink to="/explore">{(active === "explore" && !innerActive) ? exploreFill : exploreOutline}</NavLink>


          <button className="no-style " onClick={handleClickNot} >{innerActive === "notification" ?
            <svg aria-label="Notifications" className="_ab6-" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M12 2a7 7 0 0 0-7 7v4.5a3 3 0 0 1-.82 2.07L3 17.5h18l-1.18-1.93A3 3 0 0 1 19 13.5V9a7 7 0 0 0-7-7zm-1 19a2 2 0 0 0 4 0h-4z"></path></svg>
            : bellOutline}</button>


          <button onClick={handleClick} className="no-style " >
            <img style={{ minWidth: '27px', height: '27px', objectFit: 'cover', borderRadius: '50%', border: (active === "myprofile" && !innerActive) ? '2px solid #333333' : "2px solid white", marginLeft: '-2px' }} src={context?.auth?.avatar ? context.auth.avatar : defaultImg} alt="" />
          </button>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                width: '250px',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem style={{ fontSize: '13px', fontFamily: 'Poppins' }}>
              <Link to={`/${context.auth.username}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                {profileIcon}
                <span style={{ marginLeft: '12px' }}>Profile</span>
              </Link>
            </MenuItem>
            <MenuItem style={{ fontSize: '13px', fontFamily: 'Poppins' }}>
              <Link to="/saved/thenisab" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                {savedIcon}
                <span style={{ marginLeft: '12px' }}>Saved</span>
              </Link>
            </MenuItem>
            <MenuItem style={{ fontSize: '13px', fontFamily: 'Poppins' }}>
              <Link to="/accounts/edit" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                {settingsIcon}
                <span style={{ marginLeft: '12px' }}>Settings</span>
              </Link>
            </MenuItem>
            <MenuItem style={{ fontSize: '13px', fontFamily: 'Poppins' }}>
              {switchAccountIcon}
              <span style={{ marginLeft: '12px' }}>Switch accounts</span>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => logout()} style={{ fontSize: '13px', fontFamily: 'Poppins' }}>
              <span style={{ marginLeft: '7px' }}>Logout</span>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};
