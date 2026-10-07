import { useState } from "react";
import { updateProfile } from "../../api/api.js";
import Avatar from "./Avatar.jsx";

const ProfileEditor = ({ user, onClose }) => {
    const [username,setUsername]=useState(user?.username||"");
    const [email,setEmail]=useState(user?.email||"");
    const [picture,setPicture]=useState(user?.profilePicture||null);
    const [password,setPassword]=useState("");
    const [message,setMessage]=useState("");
    const read=(file)=>{ if(!file)return; if(file.size>1_800_000){setMessage("Choose an image smaller than 1.8 MB.");return;} const r=new FileReader(); r.onload=()=>setPicture(String(r.result)); r.readAsDataURL(file); };
    const save=async(e)=>{e.preventDefault();try{const r=await updateProfile({username,email,profilePicture:picture,...(password?{password}: {})});localStorage.setItem("user",JSON.stringify({...user,...r.user}));window.location.reload();}catch(err){setMessage(err.message);}};
    return <div className="modal-backdrop" onMouseDown={onClose}><div className="sidebar-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-heading"><h3>Your profile</h3><button className="modal-close" onClick={onClose}>×</button></div><form className="modal-form" onSubmit={save}><Avatar name={username} profilePicture={picture}/><label>Profile picture<input type="file" accept="image/*" onChange={e=>read(e.target.files?.[0])}/></label><button type="button" className="secondary-button" onClick={()=>setPicture(null)}>Remove picture</button><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password (optional)" type="password"/><button className="primary-button">Save profile</button>{message&&<p className="error">{message}</p>}</form></div></div>;
};
export default ProfileEditor;
