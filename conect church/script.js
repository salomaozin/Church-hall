// ========================================
// CHURCH HALL - JAVASCRIPT SEPARADO
// ========================================

const firebaseConfig = {
    apiKey: "SUA_KEY",
    authDomain: "SEU_DOMINIO", 
    projectId: "SEU_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let user, userData;

// Mostrar seções
function mostrar(id) {
    ['auth', 'dashboard', 'pregadores', 'bandas', 'chatBox', 'historicoBox']
        .forEach(x => document.getElementById(x).style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// Registro de usuário
function registrar() {
    auth.createUserWithEmailAndPassword(email.value, senha.value)
        .then(res => {
            return db.collection('usuarios').doc(res.user.uid).set({
                nome: nome.value,
                cpf: cpf.value,
                email: email.value,
                tipo: tipo.value,
                instagram: instagram.value,
                youtube: youtube.value,
                dataNascimento: document.getElementById("data de nascimento").value
            });
        })
        .then(() => {
            alert('Conta criada');
            carregarHome();
        });
}

// Login
function login() {
    auth.signInWithEmailAndPassword(emailLogin.value, senhaLogin.value)
        .then(res => {
            user = res.user;
            carregarUsuario(res.user.uid);
            carregar();
            carregarHome();
            mostrar('home');
        });
}

// Carregar dados do usuário
function carregarUsuario(uid) {
    db.collection('usuarios').doc(uid).get().then(doc => {
        userData = doc.data();
        userInfo.innerHTML = `${userData.nome} (${userData.tipo})<br>
            <a class='link' href='${userData.instagram}' target='_blank'>Instagram</a><br>
            <a class='link' href='${userData.youtube}' target='_blank'>YouTube</a>`;
    });
}

// Salvar pregador
function salvarPregador() {
    if (userData.tipo != 'pregador') return alert('Apenas pregadores');
    db.collection('pregadores').add({
        nome: pNome.value,
        cidade: cidade.value,
        valor: valor.value
    });
}

// Salvar banda
function salvarBanda() {
    if (userData.tipo != 'banda') return alert('Apenas bandas');
    db.collection('bandas').add({
        nome: bNome.value,
        cidade: bCidade.value,
        valor: bValor.value,
        integrantes: integrantes.value,
        instrumentos: instrumentos.value,
        agenda: agenda.value
    });
}

// Contratar pregador
function contratarPregador(nomeP) {
    if (userData.tipo != 'igreja') return alert('Apenas igrejas');
    db.collection('historico').add({
        user: user.email,
        tipo: 'pregador',
        nome: nomeP,
        data: new Date().toLocaleDateString()
    });
}

// Contratar banda
function contratarBanda(nomeB) {
    if (userData.tipo != 'igreja') return alert('Apenas igrejas');
    db.collection('historico').add({
        user: user.email,
        tipo: 'banda',
        nome: nomeB,
        data: new Date().toLocaleDateString()
    });
}

// Enviar mensagem chat
function enviarMsg() {
    db.collection('chat').add({
        nome: user.email,
        msg: msg.value
    });
    msg.value = '';
}

// Carregar home (destaques)
function carregarHome() {
    db.collection('usuarios').onSnapshot(snap => {
        cardsHome.innerHTML = '';
        snap.forEach(doc => {
            let u = doc.data();
            if (u.tipo == 'pregador' || u.tipo == 'banda') {
                cardsHome.innerHTML += `
                    <div class="item">
                        <h3>${u.nome}</h3>
                        <p><b>Tipo:</b> ${u.tipo}</p>
                        <p><b>Email:</b> ${u.email}</p>
                        <p><a class='link' href='${u.instagram}' target='_blank'>Instagram</a></p>
                        <p><a class='link' href='${u.youtube}' target='_blank'>YouTube</a></p>
                        <button onclick="contratarDireto('${u.nome}','${u.tipo}')">Contratar</button>
                    </div>
                `;
            }
        });
    });
}

// Contratar direto da home
function contratarDireto(nome, tipo) {
    if (!userData) {
        return alert('Faça login primeiro');
    }
    if (userData.tipo != 'igreja') {
        return alert('Apenas igrejas podem contratar');
    }
    db.collection('historico').add({
        user: user.email,
        tipo: tipo,
        nome: nome,
        data: new Date().toLocaleDateString()
    });
    alert('Contratação enviada!');
}

// Carregar todas as listas
function carregar() {
    // Pregadores
    db.collection('pregadores').onSnapshot(snap => {
        listaPregadores.innerHTML = '';
        snap.forEach(d => {
            let p = d.data();
            listaPregadores.innerHTML += `<div class='item'>${p.nome} - ${p.cidade} R$${p.valor}<br>
                <button onclick="contratarPregador('${p.nome}')">Contratar</button></div>`;
        });
    });

    // Bandas
    db.collection('bandas').onSnapshot(snap => {
        listaBandas.innerHTML = '';
        snap.forEach(d => {
            let b = d.data();
            listaBandas.innerHTML += `<div class='item'><b>${b.nome}</b><br>
                ${b.cidade} | ${b.integrantes} integrantes<br>
                🎵 ${b.instrumentos}<br>
                📅 ${b.agenda}<br>
                R$${b.valor}<br>
                <button onclick="contratarBanda('${b.nome}')">Contratar</button></div>`;
        });
    });

    // Chat
    db.collection('chat').onSnapshot(snap => {
        chat.innerHTML = '';
        snap.forEach(d => chat.innerHTML += d.data().nome + ': ' + d.data().msg + '<br>');
    });

    // Histórico
    db.collection('historico').where('user', '==', user.email).onSnapshot(snap => {
        historico.innerHTML = '';
        snap.forEach(d => {
            let h = d.data();
            historico.innerHTML += `<div class='item'>${h.tipo} - ${h.nome} (${h.data})</div>`;
        });
    });
}