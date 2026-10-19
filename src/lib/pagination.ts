// Paginação por limit/offset compartilhada pelos endpoints de listagem.
// limit padrão: 100; máximo: 200.
export function parsePagination(searchParams: URLSearchParams) {
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const rawOffset = Number.parseInt(searchParams.get("offset") ?? "", 10);

  return {
    limit: Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 200)
      : 100,
    offset: Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0,
  };
}
