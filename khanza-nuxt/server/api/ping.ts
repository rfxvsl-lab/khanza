export default defineEventHandler((event) => {
  return {
    status: 'ok',
    message: 'Khanza Repaint is awake!',
    timestamp: new Date().toISOString()
  }
})
