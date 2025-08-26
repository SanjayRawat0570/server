import prisma from '../config/prismaClient.js';

export const getLeads = async (req, res) => {
  try {
    // --- Pagination ---
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // --- Filter Clause Construction ---
    const where = {};
    const { query } = req;

    // String filters
    if (query.email) where.email = { equals: query.email, mode: 'insensitive' };
    if (query.company_contains) where.company = { contains: query.company_contains, mode: 'insensitive' };
    if (query.city) where.city = { equals: query.city, mode: 'insensitive' };
    
    // Enum filters
    if (query.status) where.status = { equals: query.status };
    if (query.status_in) where.status = { in: query.status_in.split(',') };
    if (query.source) where.source = { equals: query.source };
    if (query.source_in) where.source = { in: query.source_in.split(',') };

    // Number filters
    if (query.score) where.score = { equals: parseInt(query.score) };
    if (query.score_gt) where.score = { ...where.score, gt: parseInt(query.score_gt) };
    if (query.score_lt) where.score = { ...where.score, lt: parseInt(query.score_lt) };
    if (query.score_between) {
      const [min, max] = query.score_between.split(',');
      where.score = { gte: parseInt(min), lte: parseInt(max) };
    }

    // Date filters
    if (query.created_at_on) {
        const date = new Date(query.created_at_on);
        where.createdAt = { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) };
    }
    if (query.created_at_before) where.createdAt = { ...where.createdAt, lt: new Date(query.created_at_before) };
    if (query.created_at_after) where.createdAt = { ...where.createdAt, gte: new Date(query.created_at_after) };
    
    // Boolean filter
    if (query.is_qualified) where.is_qualified = query.is_qualified === 'true';

    // --- Database Query ---
    const [leads, total] = await prisma.$transaction([
      prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.lead.count({ where }),
    ]);

    res.status(200).json({
      data: leads,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads', error: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const newLead = await prisma.lead.create({ data: req.body });
    res.status(201).json(newLead);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: `A lead with this email already exists.` });
    }
    res.status(400).json({ message: 'Failed to create lead', error: error.message });
  }
};

export const getLeadById = async (req, res) => {
  const { id } = req.params;
  try {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ message: `Lead with ID ${id} not found` });
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateLead = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedLead = await prisma.lead.update({ where: { id }, data: req.body });
    res.status(200).json(updatedLead);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: `Lead with ID ${id} not found` });
    }
    res.status(400).json({ message: 'Failed to update lead', error: error.message });
  }
};

export const deleteLead = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lead.delete({ where: { id } });
    res.status(204).send(); 
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: `Lead with ID ${id} not found` });
    }
    res.status(500).json({ message: 'Failed to delete lead', error: error.message });
  }
};
