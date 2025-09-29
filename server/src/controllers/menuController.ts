import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { menuId } = req.query; comes from: url?menuId=1
    // const { menuId } = req.params; comes from: url/menu/1 (url/menu/:menuId)
    const menus = await prisma.menu.findMany();
    res.status(200).json(menus);
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving menus: ${error.message}` });
  }
};
