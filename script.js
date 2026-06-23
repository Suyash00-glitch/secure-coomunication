document.addEventListener('DOMContentLoaded', function () {

  // store selected values per block (in case there are multiple forms on the page)
  const dataStore = new WeakMap();

  function getBlock(el) {
    return el.closest('[data-response-block]');
  }

  function getSelectedArray(block) {
    if (!dataStore.has(block)) dataStore.set(block, []);
    return dataStore.get(block);
  }

  function renderSelected(block) {
    const list = block.querySelector('[data-selected-list]');
    const selected = getSelectedArray(block);

    list.innerHTML = '';
    selected.forEach((val, idx) => {
      const item = document.createElement('div');
      item.className = 'selected-item';
      item.innerHTML = `<span>${val}</span>`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-remove';
      removeBtn.textContent = '-';
      removeBtn.addEventListener('click', () => {
        selected.splice(idx, 1);
        renderSelected(block);
        syncOptionVisibility(block);
      });

      item.appendChild(removeBtn);
      list.appendChild(item);
    });
  }

  // grey out / hide options already selected
  function syncOptionVisibility(block) {
    const selected = getSelectedArray(block);
    block.querySelectorAll('.option-item[data-value]').forEach(opt => {
      const val = opt.dataset.value;
      if (selected.includes(val)) {
        opt.classList.add('option-added');
        opt.querySelector('.btn-add').disabled = true;
      } else {
        opt.classList.remove('option-added');
        opt.querySelector('.btn-add').disabled = false;
      }
    });
  }

  function addValue(block, value) {
    value = value.trim();
    if (!value) return;
    const selected = getSelectedArray(block);
    if (!selected.includes(value)) {
      selected.push(value);
      renderSelected(block);
      syncOptionVisibility(block);
    }
  }

  // event delegation: handles + on predefined options
  document.addEventListener('click', function (e) {
    if (e.target.matches('.btn-add')) {
      const block = getBlock(e.target);
      const optionItem = e.target.closest('.option-item');
      addValue(block, optionItem.dataset.value);
    }

    // + on custom input
    if (e.target.matches('.btn-add-custom')) {
      const block = getBlock(e.target);
      const input = e.target.closest('.option-item').querySelector('.custom-input');
      addValue(block, input.value);
      input.value = '';
    }
  });

  // allow pressing Enter in custom input too
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('.custom-input') && e.key === 'Enter') {
      e.preventDefault();
      const block = getBlock(e.target);
      addValue(block, e.target.value);
      e.target.value = '';
    }
  });

  // expose a getter so you can call this on form submit
  window.getResponseValues = function (blockEl) {
    return getSelectedArray(blockEl);
  };

});






//added before this

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
  }
  function showLogin() {
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
  }
  const pageNames = {
    'dashboard': 'Dashboard',
    'ticket-list': 'Ticket List',
    'create-ticket': 'Create Ticket',
    'ticket-detail': 'Ticket Detail',
    'notif-list': 'Notification List',
    'create-notif': 'Create Notification',
    'notif-detail': 'Notification Detail',
    'user-master': 'User Master',
    'dept-master': 'Department Master'
  };
  const pageSections = {
    'dashboard': 'Home',
    'ticket-list': 'Tickets',
    'create-ticket': 'Tickets',
    'ticket-detail': 'Tickets',
    'notif-list': 'Notifications',
    'create-notif': 'Notifications',
    'notif-detail': 'Notifications',
    'user-master': 'Administration',
    'dept-master': 'Administration'
  };
  function showPage(id, navEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pg = document.getElementById('page-' + id);
    if (pg) pg.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');
    const bc = document.getElementById('breadcrumb');
    if (bc) bc.innerHTML = pageSections[id] + ' / <span>' + pageNames[id] + '</span>';
    document.querySelector('.content').scrollTop = 0;
  }


  /////suyash


  async function createTick(){
    const title = document.getElementById("text-20").value;

    const department_name = document.getElementById("select-21").value;

    const description = document.getElementById("textarea-23").value;

      //for response 

      // when your form submit button is clicked

    const block = document.querySelector('[data-response-block]');

    const responseArray = window.getResponseValues(block);
 
    const res =

  await fetch("/api/tickets", {method:"POST",headers:{"Content-Type":"application/json" ,
                 "Authorization":
`Bearer ${token}`
  },
 
body:
JSON.stringify({title:title , department_name:department_name, description:description , expectedResponses:responseArray})

}

); 


  const data =await res.json();
  console.log(data);

  if(res.ok){ 
    showPage("ticket-detail");
  }

}

function cancelTick(){
  const confirmed = confirm("Are you sure you want to cancel this ticket?");

if(confirmed){
  document.querySelector("form").reset();

// clear selected responses too

  document.querySelector("[data-selected-list]").innerHTML ="";


  showPage("dashboard");

}
}


async function createNotify(){

try{

const title = document.getElementById("text-30").value;

const description = document.getElementById("textarea-31").value;


// selected departments

const block = document.querySelector("[data-department-block]");

const departments = window.getDepartmentValues(block);


// send backend request

const res = await fetch( "/api/notifications",
{
method:
"POST",
headers:{
"Content-Type":
"application/json" , 
"Authorization":
`Bearer ${token}`
},
body:JSON.stringify({title,description,departments})

}

);


const data =await res.json();

console.log(data);

if(res.ok){

alert("Notification created");

showPage("notif-list");

}

else{
alert(data.error);
}

}

catch(err){
console.error(err);
alert("Something went wrong");
}

}









function cancelNotify(){

const confirmed =

confirm("Are you sure you want to cancel creating this notification?");

if(confirmed){ 
  document.getElementById("notification-form").reset();


// clear selected departments

const selected = document.querySelector("[data-selected-list]");

if(selected){

selected.innerHTML = "";

}


showPage("dashboard");

}

}




async function loadNotifications(){

const res = await fetch( "/api/notifications" , {headers:{ "Authorization":`Bearer ${token}`}});

const data = await res.json();

const body =document.getElementById("notification-body");

body.innerHTML ="";

data.forEach(n => { body.innerHTML +=

`<tr>

<td>
NTF-${String(n.notification_id).padStart(4,'0')}
</td>

<td>
${n.title}
</td>
<td>
${n.departments}
</td>
<td>
${n.name}
</td>
<td>
${new Date(n.created_at).toLocaleDateString()}
</td>
<td>
<span class="badge badge-active"> Published </span>
</td>
<td>
<button class="action-btn" onclick= "openNotification(${n.notification_id})"> View </button>
</td>
</tr> `;
});


}



async function loadTickets(){

const res = await fetch("/api/tickets" , { headers:{"Authorization":`Bearer ${token}`}});

const data = await res.json();

const body =document.getElementById("ticket-body");

body.innerHTML ="";

data.forEach(t => {body.innerHTML +=
`
<tr>
<td style="color:#1a73e8;font-weight:600">
TKT-${String(t.ticket_id).padStart(4,'0')}   //formatting tick number
</td>
<td>
${t.title}
</td>
<td>
${t.department_name}
</td>
<td>
-
</td>
<td>
<span class="badge">
${t.status_name}
</span>
</td>
<td>
${new Date(t.created_at).toLocaleDateString()}
</td>
<td>
${new Date(t.updated_at).toLocaleDateString()}
</td>
<td>
<button class="action-btn" onclick = "openTicket(${t.ticket_id})" > View </button>
</td>
</tr>
`;});

}

async function openTick(){
    await loadTickets ();

    showPage('ticket-list');
}

async function openNotif(){
    await loadNotifications();

    showPage('notif-list');
}

async function openTicket(ticketId){

try{

const res =

await fetch(`/api/tickets/${ticketId}`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const data =await res.json();
// fill page

document.getElementById("detail-ticket-title").innerText =`Ticket Detail — TKT-${String(data.ticket_id).padStart(4,'0')}`;


document.getElementById("detail-submitted").innerText =`Submitted on ${new Date(data.created_at).toLocaleDateString()}`;


document.getElementById("detail-status").innerText =data.status_name;
  

document.getElementById("detail-ticket-id").innerText =`TKT-${String(data.ticket_id).padStart(4,'0')}`;


document.getElementById("detail-subject").innerText =data.title;


document.getElementById("detail-department").innerText =data.department_name;


document.getElementById("detail-created-by").innerText = data.username;


document.getElementById("detail-created-date").innerText =new Date(data.created_at).toLocaleString();


document.getElementById("detail-updated-date").innerText =new Date(data.updated_at).toLocaleString();


document.getElementById("detail-description").innerText = data.description;

showPage("ticket-detail");
}

catch(err){
console.log(err);

alert("Unable to load ticket");

}

}


async function openNotification(id){

const res = await fetch(`/api/notifications/${id}` ,  {headers:{"Authorization":`Bearer ${token}`}});

const data = await res.json();


// header

document.getElementById("notif-detail-title").innerText =`Notification Detail — NTF-${String(data.notification_id).padStart(4,'0')}`;


document.getElementById("notif-detail-date")

.innerText = `Published on ${new Date(data.created_at).toLocaleDateString()}`;


document.getElementById("notif-detail-status").innerText = "Published";


// info


document.getElementById("notif-id").innerText = `NTF-${String(data.notification_id).padStart(4,'0')}`;


document.getElementById("notif-title").innerText =data.title;


document.getElementById("notif-created-by").innerText =data.username;

document.getElementById("notif-created-date").innerText = new Date(data.created_at).toLocaleString();


document.getElementById("notif-status").innerText ="Published";

document.getElementById("notif-description").innerText = data.description;



// department badges

const dept = document.getElementById("notif-departments");

dept.innerHTML ="";

data.departments.forEach(d => {

dept.innerHTML +=
`
<span class="badge badge-open">

${d}

</span>

`;

}
);


// department cards

const cards = document.getElementById("notif-department-list");

cards.innerHTML ="";


data.departments.forEach(d => {

cards.innerHTML +=
`
<div class= "dept-icon-row">

<div class="dept-icon-box">

<i class="ti ti-building">

</i>

</div>


<div>

<div style="font-size:13px;font-weight:500">

${d}

</div>

</div>

</div>

`;
});


showPage("notif-detail");

}