import { Request, Response, Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get reminders with optional filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const { accountNumber, completed } = req.query;
        const where: any = {};

        if (accountNumber) {
            where.account_number = accountNumber;
        }
        if (completed !== undefined) {
            where.completed = completed === 'true' ? 1 : 0;
        }

        const reminders = await prisma.reminder.findMany({
            where,
            orderBy: [{ completed: 'asc' }, { due_date: 'asc' }]
        });

        res.json(reminders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create reminder
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            account_number,
            reminder_type,
            due_date,
            description
        } = req.body;

        const reminder = await prisma.reminder.create({
            data: {
                account_number,
                reminder_type,
                due_date,
                description,
                completed: 0
            }
        });

        res.status(201).json(reminder);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Toggle complete state
router.put('/:id/complete', async (req: Request, res: Response) => {
    try {
        const reminder = await prisma.reminder.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        const updated = await prisma.reminder.update({
            where: { id: Number(req.params.id) },
            data: {
                completed: reminder.completed ? 0 : 1
            }
        });

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete reminder
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.reminder.delete({
            where: { id: Number(req.params.id) }
        });

        res.json({ message: 'Reminder deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
