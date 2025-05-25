// For now, this component will assume content is plain text or simple HTML.
// For robust HTML rendering from a WYSIWYG, consider a sanitizer like DOMPurify.
// For Markdown, use a library like 'marked' or 'react-markdown'.

export interface TextBlockConfig {
  content: string;
}

interface RenderTextBlockProps {
  config: TextBlockConfig;
}

export default function RenderTextBlock({ config }: RenderTextBlockProps) {
  if (!config || typeof config.content !== 'string') {
    return <div className="text-center text-red-500 p-4">TextBlock configuration is missing or invalid.</div>;
  }

  // Basic check if content might be HTML (very naive)
  // A more robust solution would be to know the source format (e.g., if admin saves as HTML or Markdown)
  const mightBeHtml = /<[a-z][\s\S]*>/i.test(config.content);

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {mightBeHtml ? (
          // Using prose to style basic HTML elements from a WYSIWYG editor
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none mx-auto" 
            dangerouslySetInnerHTML={{ __html: config.content }} 
          />
        ) : (
          // Render as plain text, preserving whitespace and newlines
          <p className="text-gray-700 whitespace-pre-line text-base leading-relaxed">
            {config.content}
          </p>
        )}
      </div>
    </section>
  );
}
