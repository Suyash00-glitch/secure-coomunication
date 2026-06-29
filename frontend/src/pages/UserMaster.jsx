
import { useState } from "react";
import Modal from "../components/Modal.jsx";

export default function UserMaster({
  users,
  onAdd,
  onUpdate,
  onDelete,
  onActivate,
  departments
})






{

   
const [search,setSearch]=useState("");
const [roleFilter,setRoleFilter]=useState("all_roles");
const [deptFilter,setDeptFilter]=useState("all_departments");
const [statusFilter,setStatusFilter]=useState("all_statuses");
const [modal,setModal]=useState(null);

function getDeptName(id){

return departments.find(
d=>d.department_id===id
)?.department_name || "-";

}

const filtered = users.filter(u=>{

const q =
search.toLowerCase();

const matchSearch =

!q ||

u.username?.toLowerCase().includes(q) ||

String(u.user_id).includes(q);

const matchRole =

roleFilter==="all_roles"

||

u.role===roleFilter;

const matchDept =

deptFilter==="all_departments"

||

getDeptName(
u.department_id
)===deptFilter;

const matchStatus =

statusFilter==="all_statuses"

||

(

statusFilter==="Active"

&&

u.is_active

)

||

(

statusFilter==="Inactive"

&&

!u.is_active

);

return (

matchSearch

&&

matchRole

&&

matchDept

&&

matchStatus

);

});


return(

<div>

<div className="page-header">

<div>

<div className="page-title">

User Master

</div>

<div className="page-sub">

Manage users

</div>

</div>

<button
className="btn btn-primary"
onClick={()=>setModal("add")}
>

Add User

</button>

</div>

<div className="card">

<div className="search-row">

<input

className="search-input"

placeholder="Search username or id"

value={search}

onChange={e=>setSearch(e.target.value)}

/>

<select className="filter-select" value={roleFilter}

onChange={e=> setRoleFilter(e.target.value)}>

<option value="all_roles">

All Roles

</option>

<option value="admin">

admin

</option>

<option value="outside">

outside

</option>

<option value="secure">

secure

</option>

</select>

<select className="filter-select" value={deptFilter}

onChange={ e=> setDeptFilter(e.target.value)}>

<option value="all_departments">

All Departments

</option>

{

departments.map(

d=>(

<option

key={d.department_id}

value={d.department_name}

>

{

d.department_name

}

</option>

)

)

}

</select>

<select

className="filter-select"

value={statusFilter}

onChange={

e=>

setStatusFilter(

e.target.value

)

}

>

<option value="all_statuses">

All Statuses

</option>

<option value="Active">

Active

</option>

<option value="Inactive">

Inactive

</option>

</select>

</div>

<table>

<thead>

<tr>

<th>ID</th>

<th>Username</th>

<th>Department</th>

<th>Role</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

{

filtered.map(

u=>(

<tr key={u.user_id}>

<td>

{u.user_id}

</td>

<td>

{u.username}

</td>

<td>

{

getDeptName(

u.department_id

)

}

</td>

<td>

{u.role}

</td>

<td>

<span

className={

`badge ${

u.is_active

?

"badge-active"

:

"badge-inactive"

}`

}

>

{

u.is_active

?

"Active"

:

"Inactive"

}

</span>

</td>

<td>

<div
style={{
display:"flex",
gap:8
}}
>

<button

className="action-btn"

onClick={() => {



setModal({

mode:"edit",

user:u

});

}}

>

Edit

</button>

{u.is_active ? (

<button
className="action-btn action-btn-danger"
onClick={()=>{
setModal({
mode:"delete",
user:u
});
}}
>
Deactivate
</button>

) : (

<button
className="action-btn"
onClick={()=>{
setModal({
mode:"activate",
user:u
});
}}
>
Activate
</button>

)}

</div>

</td>

</tr>

)

)

}

</tbody>

</table>

</div>


{

modal?.mode==="edit"

&&

<UserFormModal

title="Edit User"

departments={departments}

initial={modal.user}

onClose={()=>setModal(null)}

onSubmit={(data)=>{

onUpdate(

modal.user.user_id,

data

);

setModal(null);

}}

>

</UserFormModal>

}

{

modal==="add"

&&

<UserFormModal

title="Add User"

departments={departments}

onClose={()=>setModal(null)}

onSubmit={(data)=>{

onAdd(data);

setModal(null);

}}

>

</UserFormModal>

}


{

modal?.mode==="delete"

&&

<Modal

title="Deactivate User"

onClose={()=>setModal(null)}

footer={

<>

<button
className="btn"

onClick={()=>setModal(null)}

>

Cancel

</button>

<button

className="btn btn-danger"

onClick={()=>{

onDelete(

modal.user.user_id

);

setModal(null);

}}

>

Deactivate

</button>

</>

}

>

Deactivate

<strong>

{

modal.user.username

}

</strong>

?

</Modal>

}


{
modal?.mode==="activate"

&&

<Modal

title="Activate User"

onClose={()=>setModal(null)}

footer={

<>

<button
className="btn btn-secondary"
onClick={()=>setModal(null)}
>

Cancel

</button>

<button
className="btn btn-primary"
onClick={()=>{

onActivate(modal.user.user_id);

setModal(null);

}}
>

Activate

</button>

</>

}

>

Activate <strong>{modal.user.username}</strong>?

</Modal>

}




</div>

);

}



function UserFormModal({
title,
departments,
initial,
onClose,
onSubmit
}){

const [username,setUsername]=useState(
initial?.username || ""
);

const [department,setDepartment]=useState(
initial?.department_id || ""
);

const [role,setRole]=useState(
initial?.role || ""
);

const [status,setStatus]=useState(

initial

?

(

initial.is_active

?

"Active"

:

"Inactive"

)

:

"Active"

);

function handleSubmit(e){

e.preventDefault();

onSubmit({

username,

department_id:
Number(
department
),

role,

is_active:

status==="Active"

});

}

return(

<Modal

title={title}

onClose={onClose}

footer={

<>

<button
className="btn btn-secondary"
onClick={onClose}
>

Cancel

</button>

<button
className="btn btn-primary"
onClick={handleSubmit}
>

{

initial

?

"Update"

:

"Add"

}

</button>

</>

}

>

<form>

<div className="form-full">

<label>

Username

</label>

<input

className="form-input"

value={username}

onChange={

e=>

setUsername(

e.target.value

)

}

/>

</div>

<div className="form-full">

<label>

Department

</label>

<select

className="form-select"

value={department}

onChange={

e=>

setDepartment(

e.target.value

)

}

>

<option value="">

Select

</option>

{

departments.map(

d=>(

<option

key={d.department_id}

value={d.department_id}

>

{

d.department_name

}

</option>

)

)

}

</select>

</div>

<div className="form-full">

<label>

Role

</label>

<select

className="form-select"

value={role}

onChange={

e=>

setRole(

e.target.value

)

}

>

<option value="admin">

Admin

</option>

<option value="outside">

Outside

</option>

<option value="secure">

Secure

</option>

</select>

</div>

<div className="form-full">

<label>

Status

</label>

<select

className="form-select"

value={status}

onChange={

e=>

setStatus(

e.target.value

)

}

>

<option>

Active

</option>

<option>

Inactive

</option>

</select>

</div>

</form>

</Modal>

);

}


