export function getPaginationData(
  p: ArgsGet | ArgsPost,
) {
  const prev = Math.max(p.from - p.limit, 0);
  const next = Math.min(p.from + p.limit, p.total - 1);
  const commonValues = {
    hasPrev: p.from > 0,
    first: p.from + 1,
    last: Math.min(p.from + p.limit, p.total),
    hasNext: p.from < p.total - p.limit,
    total: p.total,
  };
  if (p.type === "get") {
    return {
      ...commonValues,
      isPost: false as const,
      prev: setFrom(p.url, prev),
      next: setFrom(p.url, next),
    };
  }
  return {
    ...commonValues,
    isPost: true as const,
    prev: `${prev}`,
    next: `${next}`,
    payload: Object.entries(p.payload),
  };
}

interface ArgsCommon {
  from: number;
  limit: number;
  total: number;
}

interface ArgsGet extends ArgsCommon {
  type: "get";
  url: URL;
}

interface ArgsPost extends ArgsCommon {
  type: "post";
  payload: Record<string, unknown>;
}

function setFrom(urlArg: URL, value: number) {
  const url = new URL(urlArg.toString());
  if (value === 0) {
    url.searchParams.delete("from");
  } else {
    url.searchParams.set("from", `${value}`);
  }
  return `${url.pathname}${url.search}`;
}
