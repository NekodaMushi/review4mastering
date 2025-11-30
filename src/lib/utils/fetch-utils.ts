interface FetchOptions extends RequestInit {
  timeout?: number;
}

interface FetchResult<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}

export async function safeFetch<T>(
  url: string,
  options?: FetchOptions
): Promise<FetchResult<T>> {
  const { timeout = 10000, ...fetchOptions } = options ?? {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`📡 [FETCH] ${fetchOptions.method || "GET"} ${url}`);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`📊 [RESPONSE] Status: ${response.status} for ${url}`);

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage = `HTTP ${response.status}: ${errorBody || response.statusText}`;
      console.error(`❌ [ERROR] ${errorMessage}`);

      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log(`✅ [SUCCESS] Data received from ${url}`, data);

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    let errorMessage = "Unknown error";
    if (error instanceof TypeError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error(`❌ [CATCH ERROR] ${url}:`, errorMessage);

    return {
      data: null,
      error: errorMessage,
      status: null,
    };
  }
}

export async function safeFetchWithRetry<T>(
  url: string,
  options?: FetchOptions & { retries?: number }
): Promise<FetchResult<T>> {
  const { retries = 3, ...restOptions } = options ?? {};

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`🔄 [ATTEMPT ${attempt}/${retries}] ${url}`);
    const result = await safeFetch<T>(url, restOptions);

    if (!result.error) {
      return result;
    }

    if (result.status && result.status >= 400 && result.status < 500) {
      return result;
    }

    if (attempt < retries) {
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { data: null, error: "Max retries exceeded", status: null };
}
