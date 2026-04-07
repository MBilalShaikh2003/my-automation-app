"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveWorkflow(nodes, edges, workflowId = null) {
  try {
    const workflow = await prisma.workflow.upsert({
      where: {
        id: workflowId || 'new-id-placeholder', // If no ID, use a placeholder that won't match
      },
      update: {
        nodes,
        edges,
        updatedAt: new Date(),
      },
      create: {
        name: "My Automation",
        nodes,
        edges,
      },
    });

    return { success: true, id: workflow.id };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: error.message };
  }
}


export async function getLatestWorkflow() {
  try {
    const workflow = await prisma.workflow.findFirst({
      orderBy: {
        createdAt: 'desc', // Get the most recent one
      },
    });
    return { success: true, workflow };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { success: false, error: error.message };
  }
}