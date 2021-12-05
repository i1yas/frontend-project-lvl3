export const parseXML = (rawData) => {
  const parser = new DOMParser();
  const node = parser.parseFromString(rawData, 'application/xml');
  return node;
};

const parseItem = (itemNode) => {
  const title = itemNode.querySelector('title').textContent;
  const description = itemNode.querySelector('description').textContent;

  const pubDateString = itemNode.querySelector('pubDate').textContent;
  const pubDate = new Date(pubDateString);

  return { title, description, pubDate };
};

export const parseFeed = (rssTree) => {
  try {
    const channelTree = rssTree.querySelector('channel');
    const title = channelTree.querySelector('title').textContent;
    const description = channelTree.querySelector('description').textContent;

    const itemNodes = Array.from(channelTree.querySelectorAll('item'));
    const items = itemNodes.map(parseItem);

    return {
      channel: {
        title,
        description,
      },
      items,
    };
  } catch (e) {
    const error = { type: 'wrong-rss-format' };
    throw error;
  }
};
