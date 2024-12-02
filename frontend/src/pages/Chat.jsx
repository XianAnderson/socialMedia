import React, { } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import ChatBox from '../components/chat/ChatBox'
import RoomName from '../components/chat/RoomName'
import { api } from '../Interceptor/apiCall'
import { Default } from '../components/chat/Default'
import { useParams } from 'react-router-dom'
import { url } from '../baseUrl'
import { Dialog, DialogTitle } from '@mui/material'
import Select from '../components/chat/Select'
import CloseIcon from '@mui/icons-material/Close';
import { useContext } from 'react'
import { AuthContext } from "../context/Auth";


export const Chat = () => {
  const [rooms, setRooms] = useState([])
  const [open, setOpen] = React.useState(false);
  const params = useParams()
  const context = useContext(AuthContext)

  useEffect(() => {
    api.get(`${url}/chat/getrooms`).then(res => {
      setRooms(res.data)
    }).catch(err => console.log(err))
  }, [])

  useEffect(() => {
    context.handleActive("chat")
  }, [context])

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  function addRoom(room) {
    const present = rooms.filter(item => item.roomId === room.roomId)
    if (present.length !== 0) return
    setRooms(prev => [...prev, room])
  }

  function deleteRoom(roomId) {
    setRooms(prev => prev.filter(item => item.roomId !== roomId))
  }

  return (
    <div className="chatpage" style={{ width: '90%', backgroundColor: 'white', border: '1px solid #dbdbdb', display: 'flex', flexDirection: 'row', height: '90vh', margin: 'auto', marginBottom: '3vh', borderRadius: '4px', marginTop: '2vh', }}>
      <div className="left_chat_bar" style={{ width: '33%', borderRight: '1px solid #dbdbdb', height: '100%', overflowY: 'scroll' }}>
        <div className="username" style={{ borderBottom: '1px solid #dbdbdb', width: '100%', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 'bold', fontSize: '15px', marginLeft: '28px' }}>{"Messages"}</p>
          <button onClick={handleClickOpen} className='no_style' style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ marginRight: '18px', fontSize: '24px', display: 'inline-block', lineHeight: '1' }} aria-label="New message" role="img">🍐</span>
          </button>
          <Dialog
            PaperProps={{
              style: {
                minHeight: '55%',
                maxHeight: '65%',
                minWidth: '400px',
                maxWidth: '400px',
                padding: 0,
                overflowY: 'auto',
                borderRadius: '15px'
              }
            }}
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleClose} style={{ borderBottom: '1px solid #d9d7d7', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: '16px' }}>
              <CloseIcon sx={{ fontSize: '22px', marginLeft: '-8px', cursor: 'pointer' }} onClick={handleClose} />
              <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginTop: '-5px', marginBottom: '-3px' }}>{"New Message"}</p>
              <p> &nbsp; </p>
            </DialogTitle>
            <Select addRoom={addRoom} handleClose={handleClose} />
          </Dialog>
        </div>
        {
          rooms?.map(item => <RoomName key={item.roomId} roomId={item.roomId} />)
        }
      </div>
      <div className="right_chatbar" style={{ width: '67%' }}>
        {
          params.id === "all" ? <Default /> :
            <ChatBox deleteRoom={deleteRoom} roomId={params.id} />
        }
      </div>
    </div>
  )
}
