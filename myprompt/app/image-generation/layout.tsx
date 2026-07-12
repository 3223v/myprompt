import ImageSidebar from "@/components/ImageSidebar";

export default function ImageGenerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex">
      <ImageSidebar />
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
}
