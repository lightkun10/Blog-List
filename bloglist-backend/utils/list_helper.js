const dummy = (blogs) => 1;

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

// const favoriteBlog = (blogs) => Math.max.apply(Math, blogs.map((blog) => blog.likes));
const favoriteBlog = (blogs) => {
  const mostFav = Math.max(...blogs.map((blog) => blog.likes));
  return blogs.filter((blog) => blog.likes === mostFav)[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
