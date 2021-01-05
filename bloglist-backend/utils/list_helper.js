const totalLikes = (blogs) => {
  if (blogs.length > 1) {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0);
  }

  if (blogs.length === 1) {
    return blogs[0].likes;
  }

  if (blogs.length === 0) {
    return 0;
  }

  return undefined;
};

const favoriteBlog = (blogs) => {
  // const favoriteBlog = (blogs) => Math.max.apply(Math, blogs.map((blog) => blog.likes));
  const mostFav = Math.max(...blogs.map((blog) => blog.likes));
  return blogs.filter((blog) => blog.likes === mostFav)[0];
};

const mostBlogs = (blogs) => {
  const authorBlogs = new Map();

  blogs.forEach((blog) => {
    authorBlogs.set(blog.author, { author: blog.author, blogs: 0 });
  });

  blogs.forEach((blog) => {
    const updateCount = authorBlogs.get(blog.author).blogs + 1;
    authorBlogs.set(blog.author, { author: blog.author, blogs: updateCount });
  });

  let biggest = 0;

  authorBlogs.forEach((val) => {
    if (biggest < val.blogs) biggest = val.blogs;
  });

  let mostBlogAuthor = {};

  authorBlogs.forEach((val, key) => {
    if (val.blogs === biggest) mostBlogAuthor = authorBlogs.get(key);
  });

  return mostBlogAuthor;
};

const mostLikes = (blogs) => {
  const authorBlogs = new Map();

  blogs.forEach((blog) => {
    authorBlogs.set(blog.author, { author: blog.author, likes: 0 });
  });

  blogs.forEach((blog) => {
    const updateCount = authorBlogs.get(blog.author).likes + blog.likes;
    authorBlogs.set(blog.author, { author: blog.author, likes: updateCount });
  });

  let biggest = 0;

  authorBlogs.forEach((val) => {
    if (biggest < val.likes) biggest = val.likes;
  });

  let mostLikedAuthor = {};

  authorBlogs.forEach((val, key) => {
    if (val.likes === biggest) mostLikedAuthor = authorBlogs.get(key);
  });

  return mostLikedAuthor;
};

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
