import { useState,useEffect } from "react";
import Login from "./components/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UserMaster from "./pages/UserMaster.jsx";
import DepartmentMaster from "./pages/DepartmentMaster.jsx";
import TicketSearch from "./pages/TicketSearch.jsx";
import NotificationSearch from "./pages/NotificationSearch.jsx";
import Modal from "./components/Modal.jsx";

export default function App() {
  
  const [loggedIn,setLoggedIn]=useState(!!localStorage.getItem("token"));
  
  const [showLogout,setShowLogout]=useState(false);

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);


const [stats,setStats] = useState({
totalUsers:0,
totalDepartments:0,
totalTickets:0,
openTickets:0,
closedTickets:0,
totalNotifications:0
});


useEffect(()=>{

const savedUser =localStorage.getItem("user");

if(savedUser){

setUser(

JSON.parse(savedUser)
);
}
},[]);


useEffect(()=>{ console.log("effectran");

if(loggedIn && localStorage.getItem("token"))

{loadDepartments();loadStats();loadUsers();}},[loggedIn]);


async function loadDepartments(){

try{

const token =localStorage.getItem("token");

const res =
await fetch(
"http://localhost:3000/api/departments",
{
headers:{Authorization:`Bearer ${token}`}});


const data =await res.json();

if(Array.isArray(data))
{

setDepartments(data);

}

else{

setDepartments([]);

}



}

catch(err){
console.log(err);
}

}



async function loadStats(){

try{

const token =localStorage.getItem("token");

const res =await fetch(

"http://localhost:3000/api/dashboard",

{

headers:{Authorization:`Bearer ${token}`}

}
);


const data =await res.json();
console.log(data);
setStats(data);

}

catch(err){

console.log(err);

}

}



async function loadUsers(){

const token =localStorage.getItem("token");

const res =await fetch(

"http://localhost:3000/api/users",

{

headers:{Authorization:`Bearer ${token}`}

});

const data =await res.json();

setUsers(Array.isArray(data) ? data:[]);

}





async function handleLogin(username,password){

const res =await fetch(

"http://localhost:3000/api/signin",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({username,password})

}

);

const data =await res.json();


if(data.token){

localStorage.setItem("token",data.token);

localStorage.setItem("user",JSON.stringify({name:username}));


setUser({name:username});

setLoggedIn(true);

}

else{

alert("login failed");

}

}




function handleLogout(){

localStorage.removeItem(
"token"
);

localStorage.removeItem(
"user"
);

setShowLogout(
false
);

setUser(
null
);

setCurrentPage(
"dashboard"
);

setLoggedIn(
false
);

}

  
async function addUser(data){

const token =localStorage.getItem("token");

await fetch(

"http://localhost:3000/api/users",

{

method:

"POST",

headers:{

Authorization:`Bearer ${token}`,

"Content-Type":

"application/json"

},

body:

JSON.stringify({

username:

data.username,

role:

data.role,

department_id:

data.department_id})

});


loadUsers();

}



  async function updateUser( id, data ){
     const token = localStorage.getItem( "token" );
      await fetch( `http://localhost:3000/api/users/${id}`, {
         method: "PUT", 
         headers:{ Authorization: `Bearer ${token}`, 
         "Content-Type": "application/json" }
         , body: JSON.stringify( data ) } ); loadUsers(); 
        
  }

 
async function deleteUser(id){

const token =localStorage.getItem("token");

await fetch(

`http://localhost:3000/api/users/${id}/deactivate`,

{

method:

"PATCH",

headers:{Authorization:`Bearer ${token}`}}

);

loadUsers();

}



  // ── Department handlers (replace with API calls) ──

async function addDepartment(data){

const token =localStorage.getItem("token");

await fetch(

"http://localhost:3000/api/departments",

{

method:"POST",

headers:{

"Content-Type":"application/json",

Authorization: `Bearer ${token}`

},

body:

JSON.stringify({

department_name:data.name
,secure_area_flag:false,
status:data.status.toUpperCase()})

});


loadDepartments();

}


  function updateDepartment(id, data) {
    setDepartments(prev => prev.map(d => d.department_id === id ? { ...d, ...data } : d));
  }

  function deleteDepartment(id) {
    setDepartments(prev => prev.filter(d => d.department_id !== id));
  }

 

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard stats={stats} />;
      case "user-master":
        return (
          <UserMaster
            users={users}
            departments={departments}
            onAdd={addUser}
            onUpdate={updateUser}
            onDelete={deleteUser}
          />
        );
      case "dept-master":
        return (
          <DepartmentMaster
            departments={departments}
            users={users}
            onAdd={addDepartment}
            onUpdate={updateDepartment}
            onDelete={deleteDepartment}
          />
        );
      case "ticket-search":
        return <TicketSearch />;
      case "notif-search":
        return <NotificationSearch notifications={notifications} />;
      default:
        return <Dashboard stats={stats} />;
    }
  }

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="main">
        <Topbar currentPage={currentPage} user={user} onLogout={()=>setShowLogout(true)} />
        <div className="content">
          {renderPage()}
        </div>
        


{

showLogout

&&

<Modal

title="Logout"

onClose={()=>setShowLogout(false)}

footer={ <>

<button className="btn btn-secondary" onClick={()=>setShowLogout(false)}>Cancel</button>

<button className="btn btn-danger" onClick={()=>{handleLogout();}}>Logout</button></>}>

<p>Are you sure you want to logout?</p>

</Modal>

}

      </div>
    </div>
  );
}
