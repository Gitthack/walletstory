// BuildStamp Component
export default function BuildStamp() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
  const env = process.env.VERCEL_ENV || 'development';
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();
  
  const shortCommit = commit.slice(0, 7);
  
  return (
    <div className="text-xs text-[--text-secondary] text-center py-4 border-t border-[--border]">
      <span className="mr-4">Commit: {shortCommit}</span>
      <span className="mr-4">Env: {env}</span>
      <span>Built: {new Date(buildTime).toLocaleString()}</span>
    </div>
  );
}
