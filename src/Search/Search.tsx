import { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";

type SearchParams = {
  search?: string;
  page?: string;
};

type Book = {
  title: string;
  author: string;
  published: number;
  code: string;
};

const SEARCH_BASE_URL = "https://openlibrary.org/search.json";
const getSearchUrl = (query: string, page?: string) => {
  const paging = page && page.length > 0 ? `&page=${page}` : "";
  return SEARCH_BASE_URL + `?q=${encodeURI(query)}${paging}`;
};

const getSearchRoute = (query: string, page?: number) => {
  const paging = page ? `/${page}` : "";
  return `/${query}${paging}`;
};

export const Search = () => {
  const params = useParams<SearchParams>();
  const initialSearch = params.search ?? "";
  const initialPage = params.page;
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [nextPage, setNextPage] = useState<number>();

  useEffect(() => {
    if (initialSearch.length > 0) {
      setIsLoading(true);
      fetch(getSearchUrl(initialSearch, initialPage))
        .then((data) => data.json())
        .then((response) => {
          const result: Book[] = response.docs.map((doc: any) => {
            const regex = /\/books\/(.+)/;
            const keyGroups = doc.seed
              .find((seed: string) => seed.indexOf("books") > 0)
              ?.match(regex);
            const key = keyGroups?.length > 1 ? keyGroups[1] : null;
            return {
              title: doc.title,
              published: doc.first_publish_year,
              author: doc.author_name?.join(", "),
              code: key
            };
          });
          setBooks(result.filter((book) => book.code !== null));
          const currentPage = parseInt(initialPage ?? "1", 10);
          const nextPage =
            response.start + response.docs.length < response.numFound
              ? currentPage + 1
              : undefined;
          setNextPage(nextPage);
        })
        .catch((error) => {
          console.log(error);
          setIsError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [initialSearch, initialPage]);

  const navigateToSearch = () => {
    history.push(getSearchRoute(searchInput));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch();
  };

  const onSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.currentTarget.value);
  };

  const onSearchButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    navigateToSearch();
  };

  return (
    <>
      <div className="search">
        <form onSubmit={onSubmit}>
          <input value={searchInput} onChange={onSearchInputChange} />
          <button onClick={onSearchButtonClick}>Search</button>
        </form>
      </div>
      {isLoading && <div className="zero-state">Loading</div>}
      {!isLoading && isError && <div className="error">Network error</div>}
      {!isLoading && !isError && books.length === 0 && (
        <div className="zero-state">No results</div>
      )}
      {!isLoading && !isError && books.length > 0 && (
        <div className="results">
          {books.map((book) => (
            <div className="result" key={book.code}>
              <Link to={`/book/${book.code}`}>
                {book.author} - {book.title}{" "}
                {book.published ? `(${book.published})` : ""}
              </Link>
            </div>
          ))}
        </div>
      )}
      {nextPage && (
        <Link to={getSearchRoute(searchInput, nextPage)}>Next page</Link>
      )}
    </>
  );
};
