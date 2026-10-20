import { ArrowLeft } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { ButtonLink } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <ErrorScreen
      code="404"
      title="Page not found"
      message="The page you're looking for doesn't exist or has moved."
    />
  );
}

/** Rendered by the router when a page throws while rendering or loading. */
export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  console.error(error);
  return (
    <ErrorScreen
      code="Error"
      title="Something went wrong"
      message="An unexpected error occurred. Please refresh the page or try again later."
    />
  );
}

function ErrorScreen({ code, title, message }: { code: string; title: string; message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">{code}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">{message}</p>
      <ButtonLink to="/" className="mt-8">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </ButtonLink>
    </div>
  );
}
