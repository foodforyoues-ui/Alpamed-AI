import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment, sendAppointmentReminders } from '../controllers/appointment.controller.js';

const router = Router();

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/reminders', sendAppointmentReminders);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
