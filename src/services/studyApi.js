import api from '../api'

export const studyApi = {
  getRooms:   ()       => api.get('/api/study/rooms'),
  createRoom: (body)   => api.post('/api/study/rooms', body),
  joinByCode: (code)   => api.post('/api/study/rooms/join', { code }),
  joinRoom:   (roomId) => api.post(`/api/study/rooms/${roomId}/join`),
  leaveRoom:  (roomId) => api.post(`/api/study/rooms/${roomId}/leave`),
}

export default studyApi