import "./styles.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Search } from "./Search/Search";
import { BookDetails } from "./BookDetails/BookDetails";
export default function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/book/:bookCode">
            <BookDetails />
          </Route>
          <Route path="/:search?/:page?">
            <Search />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
