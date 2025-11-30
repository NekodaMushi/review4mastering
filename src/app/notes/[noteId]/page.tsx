import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { NotePageClient } from "./NotePageClient";

interface PageProps {
  params: Promise<{ noteId: string }>;
}

export default async function NotePage({ params }: PageProps) {
  const { noteId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
      user_id: session.user.id,
    },
  });

  if (!note) {
    notFound();
  }

  return <NotePageClient note={note} />;
}
