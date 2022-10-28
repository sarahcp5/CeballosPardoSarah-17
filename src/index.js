import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import { Server } from 'socket.io';
import services from "../src/dao/config.js";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import viewsRouter from './routes/views.router.js';
import sessionsRouter from './routes/sessions.router.js';
import initializePassport from '../src/config/passport.config.js';
import passport from 'passport';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(express.static(__dirname+'/public'));

app.use(session({
    store: MongoStore.create({
        mongoUrl:'mongodb+srv://coderuser:coderuser@segundaentrega.s0vvnoj.mongodb.net/mongoAtlas?retryWrites=true&w=majority',
        ttl: 3600
    }),
    secret: 'CoderSession',
    resave: false,
    saveUninitialized: false,
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.engine(
    "handlebars",
    handlebars.engine()
);

app.set('views', __dirname + '/src/views');
app.set('view engine', 'handlebars');


const server = app.listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en el puerto ${server.address().port}`);
});
server.on("Error", error => console.log(`Error en servidor ${error}`));

const io = new Server(server);

app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);

io.on('connection', async(socket) => {
    console.log('Un cliente se ha conectado');
    socket.emit('messages', await services.messagesService.muestroChats());
    socket.emit('products', {products : await services.productsService.getAll()});

    socket.on('new-message', async(data) => {
        try {
            let author = await services.authorsService.getIdAuthor(data.author);
            let message = {
                author: author,
                text: data.text
            }
            await services.messagesService.save(message);
            io.sockets.emit('messages', [data]);
        } catch (error) {
            console.error("new-product",error);
        }
    });

    socket.on('new-product', async(data) => {
        try {
            await services.productsService.save(data);

            try {
                let productosAll = await services.productsService.getAll();
                io.sockets.emit('products', {products : productosAll});
            } catch (error) {
                console.error("products-socket-emit",error);
            }
        } catch (error) {
            console.error("new-product",error);
        }
    });
})

app.get("/api", async(req, res) => {
    if(req.session.user) {
        try {
            let username = {username: req.session.user.username};
            let productosAll = await services.productsService.getAll();
            
            res.render('indexForm', username);
        } catch (error) {
            console.error("/",error)
        }
    }
    else {
        res.send('Por favor loguearse primero');
    }
});

app.get("/api/products-test", async(req, res) => {
    let testProducts = await services.productsService.populate(5);
    res.send(testProducts);
});

app.get("/api/chat-normalizado", async(req, res) => {
    let chat = await services.messagesService.chatsNormalized();
    res.send(chat);
});

app.get("/api/chat-denormalizado", async(req, res) => {
    let chat = await services.messagesService.chatsDenormalized();
    res.send(chat);
});

app.get('/api/chats',async(req,res) => {
    let result = await services.messagesService.muestroChats()
    let mensajes = {
      id: 'mensajes',
      mensajes: result
    }
    res.send(mensajes);
});
