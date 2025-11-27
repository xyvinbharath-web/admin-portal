"use client";

import { useState, type ChangeEvent } from "react";
import type { CourseAdmin } from "@/services/admin/courses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CourseDetailCardProps {
  course: CourseAdmin;
  onSave: (payload: { title: string; description?: string; price: number; published: boolean }) => Promise<void>;
  pending?: boolean;
}

export function CourseDetailCard({ course, onSave, pending }: CourseDetailCardProps) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [price, setPrice] = useState<string>(String(course.price ?? 0));
  const [published, setPublished] = useState<boolean>(course.published);

  async function handleSave() {
    const parsedPrice = parseFloat(price || "0");
    await onSave({ title: title.trim(), description: description.trim() || undefined, price: parsedPrice, published });
  }

  return (
    <Card className="rounded-2xl border bg-white">
      <CardContent className="grid gap-6 p-6 md:grid-cols-3">
        <div className="space-y-3 md:col-span-2">
          <div>
            <label className="text-xs font-semibold text-slate-500">Title</label>
            <Input
              className="mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Description</label>
            <Textarea
              className="mt-1 min-h-[100px]"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500">Price</label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 text-xs text-slate-600">
              <span className="font-semibold">Visibility</span>
              <select
                className="h-9 rounded-md border bg-white px-2 text-sm"
                value={published ? "true" : "false"}
                onChange={(e) => setPublished(e.target.value === "true")}
              >
                <option value="true">Published</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>
          <div>
            <Button size="sm" onClick={handleSave} disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
        <div className="space-y-3 text-xs text-slate-600">
          <div>
            <div className="text-xs font-semibold text-slate-500">Instructor</div>
            <div className="mt-1">
              {typeof course.instructor === "string"
                ? course.instructor
                : course.instructor
                ? (
                    <>
                      <div className="text-sm font-medium text-slate-900">{course.instructor.name}</div>
                      <div className="text-xs text-slate-500">{course.instructor.email}</div>
                    </>
                  )
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Meta</div>
            <div className="mt-1 space-y-1">
              <div>
                <span className="font-semibold">Created:</span>{" "}
                {course.createdAt ? new Date(course.createdAt).toLocaleString() : "-"}
              </div>
              <div>
                <span className="font-semibold">Updated:</span>{" "}
                {course.updatedAt ? new Date(course.updatedAt).toLocaleString() : "-"}
              </div>
              <div>
                <span className="font-semibold">Lessons:</span>{" "}
                {course.lessons ? course.lessons.length : 0}
              </div>
            </div>
          </div>
          {course.lessons && course.lessons.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500">Lessons</div>
              <ul className="mt-1 max-h-48 space-y-1 overflow-auto rounded-md border bg-slate-50 p-2">
                {course.lessons.map((lesson) => (
                  <li key={lesson._id} className="text-[11px] text-slate-700">
                    <div className="font-medium">{lesson.title}</div>
                    {lesson.videoUrl && (
                      <div className="truncate text-[10px] text-slate-500">{lesson.videoUrl}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
