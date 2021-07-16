import { useEffect, useState } from "react";
import {  useHistory, useParams } from "react-router-dom";

type BookDetailsParams = {
  bookCode: string;
};

type Book = {
  title: string;
  cover?: string;
  pages?: number;
  firstPublish?: number;
  lastPublish?: number;
  genres?: string[];
};

const DETAILS_BASE_URL =
  "https://openlibrary.org/api/books?jscmd=data&format=json";
const getDetailsUrl = (code: string) => {
  return DETAILS_BASE_URL + `&bibkeys=OLID:${code}`;
};

export const BookDetails = () => {
  const params = useParams<BookDetailsParams>();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [book, setBook] = useState<Book>();

  const history = useHistory();

  useEffect(() => {
    let mounted = true;
    console.log(getDetailsUrl(params.bookCode));
    setIsLoading(true);
    fetch(getDetailsUrl(params.bookCode))
      .then((data) => data.json())
      .then((response) => {
        if (mounted) {
          console.log(response);
          const [firstKey] = Object.keys(response);
          setIsLoading(false);
          const result: Book = {
            title: response[firstKey].title,
            cover: response[firstKey].cover?.medium,
            pages: response[firstKey].number_of_pages,
            firstPublish: response[firstKey].publish_date,
            lastPublish: response[firstKey].publish_date
          };
          setBook(result);
        }
      })
      .catch((error) => {
        if (mounted) {
          console.log(error);
          setError(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, [params.bookCode]);

  return (
    <>
      {isLoading && <div className="zero-state">Loading</div>}
      {!isLoading && isError && <div className="error">Network error</div>}
      {!isLoading && !isError && book && (
        <div className="details">
          <h1>{book.title}</h1>
          {book?.cover && <img src={book.cover} alt="" />}
          <ul className="properties">
            {book.pages && <li>Pages: {book.pages}</li>}
            {book.firstPublish && <li>First published: {book.firstPublish}</li>}
            {book.lastPublish && <li>Lawt published: {book.lastPublish}</li>}
          </ul>
        </div>
      )}
      <button onClick={history.goBack}>Back</button>
    </>
  );
};
