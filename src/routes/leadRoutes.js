import express from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from '../controllers/leadController.js';

const router = express.Router();

router.route('/').post(createLead).get(getLeads);
router.route('/:id').get(getLeadById).put(updateLead).delete(deleteLead);

export default router;