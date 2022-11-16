const { Server } = require('socket.io')

const io = new Server(8000, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
})

let users = []

const addUser = (currentUser, socketId, userProfile) => {
	const checkCurrentUser = users.some((user) => user.currentUser === currentUser)

	if (!checkCurrentUser) {
		users.push({ currentUser, socketId, userProfile })
	}
}

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId)
}

const findUser = (receiverId) => {
	return users.find((user) => user.currentUser === receiverId)
}

io.on('connection', (socket) => {
	console.log('socket server is running...')

	socket.on('addUser', (currentUser, userProfile) => {
		addUser(currentUser, socket.id, userProfile)
		io.emit('getUser', users)
	})

	socket.on('sendMessage', (data) => {
		const user = findUser(data.receiverId)

		if (user !== undefined) {
			socket.to(user.socketId).emit('getMessage', {
				senderId: data.senderId,
				receiverId: data.receiverId,
				message: {
					text: data.message.text,
					image: data.message.image,
				},
				createAt: data.time,
			})
		}
	})

	socket.on('disconnect', () => {
		console.log('User is disconnected..')
		removeUser(socket.id)
		io.emit('getUser', users)
	})
})
