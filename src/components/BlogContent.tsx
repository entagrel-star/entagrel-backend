interface BlogContentProps {
  title: string;
  content: string;
  category: string;
  date?: string;
  thumbnail?: string;
}

export default function BlogContent({
  title,
  content,
  category,
  date,
  thumbnail,
}: BlogContentProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="rounded-xl w-full mb-6"
        />
      )}
      <p className="text-blue-600 text-sm uppercase font-medium">{category}</p>
      <h1 className="text-3xl font-bold mt-2 mb-4">{title}</h1>
      {date && (
        <p className="text-sm text-gray-400 mb-6">
          {new Date(date).toLocaleDateString()}
        </p>
      )}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
