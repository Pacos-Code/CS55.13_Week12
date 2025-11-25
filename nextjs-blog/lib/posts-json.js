//import fs from 'fs';
//import path from 'path';
//use Got instead, really easy to write an async await request to get content of any URL on the internet
//npm install got
import got from 'got';

//no longer need to read with path from local file, just use the URL of the JSON file
//const dataDirectory = path.join(process.cwd(), 'data');

//define URL for REST enndpoint
const dataURL = "https://dev-srjc-f2025-cs-55-13.pantheonsite.io/wp-json/twentytwentyone-child/v1/latest-posts/1";

// Returns an array of objects with params containing post IDs, used for dynamic routing in Next.js
export async function getAllPostIds() { //assignment video list as getAllIds() instead of getAllPostIds()
    // Build absolute path to the JSON data file under the local `data` directory
    //const filePath = path.join(dataDirectory, 'posts.json');
    // Build absolute path to the JSON data file under the local `data` directory
    //const jsonString = fs.readFileSync(filePath, 'utf-8');
    let jsonString;
    try {
        //next line uses got synchronously to retrieve via https our json data from wp site
        jsonString = await got(dataURL);
        console.log(jsonString.body);
    } catch (error) {
        jsonString.body = [];
        console.error(error);
    }
    // Summarize jsonObject
    // jsonObject is expected to be an array of post objects loaded from posts.json.
    // Each object typically has: id, title, author, date, and possibly other fields.
    // Example:
    // [
    //   { id: 1, title: "First Post", author: "Alice", date: "2024-01-01" },
    //   { id: 2, title: "Second Post", author: "Bob", date: "2024-02-01" }
    // ]
    //const jsonObject = JSON.parse(jsonString);
    const jsonObject = JSON.parse(jsonString.body);

    // The next lines return an array of objects, each with a `params` property containing an `id` string.
    // This is used by Next.js dynamic routing to generate paths for each post.
    // For example, if posts.json contains [{id: 1}, {id: 2}], the result will be:
    // [ { params: { id: "1" } }, { params: { id: "2" } } ]
    return jsonObject.map(item => {
        return {
            params: {
                id: item.ID.toString()
          }
        }
      });
}


// Return posts from `data/posts.json`, sorted by title and normalized for display
export async function getSortedPostsData() { //assingment video list as getSortedList() instead of getSortedPostsData()
    // Build absolute path to the JSON data file under the local `data` directory
    //const filePath = path.join(dataDirectory, 'posts.json');
    // Read the entire JSON file contents into memory as a UTF-8 string
    //const jsonString = fs.readFileSync(filePath, 'utf-8');

    let jsonString;
    try {
        //next line uses got synchronously to retrieve via https our json data from wp site
        jsonString = await got(dataURL);
        console.log(jsonString.body);
    } catch (error) {
        jsonString.body = [];
        console.error(error);
    }
    // Parse the JSON string into a JavaScript array of post objects
    //const jsonObject = JSON.parse(jsonString);
    const jsonObject = JSON.parse(jsonString.body);

    // Sort posts by title using locale-aware string comparison
    jsonObject.sort(function(a, b){
        return a.post_title.localeCompare(b.post_title);
    }); 
    // Normalize and shape the objects returned to the rest of the app
    return jsonObject.map(item =>{
        return{
            id: item.ID.toString(),
            title: item.post_title,
            date: item.post_date ? item.post_date.split(' ')[0] : '', // Truncate at space
            contentHtml: item.post_content
        }
    });
}
// The getPostData function retrieves a single post object from the posts.json file by matching the given id.
// If a post with the specified id is found, it returns the post object; otherwise, it returns a default "Not Found" object.
export async function getPostData (id) {
    // Read posts.json synchronously and return the post matching `id`; function does not need to be async
    // Note: `pages/posts/[id].js` awaits this call, but since this is synchronous, `await` is unnecessary (harmless) and can be removed
    //const filePath = path.join(dataDirectory, 'posts.json');
    //const jsonString = fs.readFileSync(filePath, 'utf-8');
    let jsonString;
    try {
        //next line uses got synchronously to retrieve via https our json data from wp site
        jsonString = await got(dataURL);
        console.log(jsonString.body);
    } catch (error) {
        jsonString.body = [];
        console.error(error);
    }

    //const jsonObject = JSON.parse(jsonString);
    const jsonObject = JSON.parse(jsonString.body);

    const objReturned = jsonObject.filter(obj => {
        return obj.ID.toString() === id;
    });
        if (objReturned.length === 0) {
            return {
                id: id,
                title: 'Not Found',
                date: '',
                contentHtml: 'Not Found'
            }
        } else{
            // Normalize the WordPress response
            return {
                id: objReturned[0].ID.toString(),
                title: objReturned[0].post_title || 'Not Found',
                date: objReturned[0].post_date ? objReturned[0].post_date.split(' ')[0] : '', // Truncate at space
                contentHtml: objReturned[0].post_content || 'Not Found'
            };
        }
    }
