import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, User,Users, FileText } from 'lucide-react';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, onClose }) => {
  const [searchType, setSearchType] = useState('posts');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Post filters
  const [postFilters, setPostFilters] = useState({
    title: '',
    kindOfPost: '',
    typeRecipe: '',
    dietaryPreferences: []
  });
    const [groupFilters, setGroupFilters] = useState({
    name: '',
    description: ''
  });
  // User filters
  const [userFilters, setUserFilters] = useState({
    username: '',
    cookingRole: '',
    group: '',
    name: ''
  });

  const kindOfPostOptions = ['recipe', 'shared thoughts'];
  const typeRecipeOptions = ['desert', 'main dish', 'appetize', 'side dish'];
  const dietaryPreferencesOptions = ['dairy-free', 'gluten-free', 'vegan', 'vegeterian'];

  const handleDietaryPreferenceChange = (preference) => {
    setPostFilters(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const handleSearch = async () => {
   let filters;
    switch (searchType) {
      case 'posts':
        filters = postFilters;
        break;
      case 'users':
        filters = userFilters;
        break;
      case 'groups':
        filters = groupFilters;
        break;
      default:
        filters = {};
    }

    const searchData = {
      type: searchType,
      query: searchQuery,
      filters: filters
    };
    await onSearch(searchData);
  };

  const handleReset = () => {
    setSearchQuery('');
    setPostFilters({
      title: '',
      kindOfPost: '',
      typeRecipe: '',
      dietaryPreferences: []
    });
    setUserFilters({
      username: '',
      cookingRole: '',
      group: '',
      name: ''
    });
    setGroupFilters({
      name: '',
      description: ''
    });
  };

  const currentFilters = searchType === 'posts' ? postFilters : userFilters;
  const hasActiveFilters = (() => {
    switch (searchType) {
      case 'posts':
        return postFilters.title || postFilters.kindOfPost || postFilters.typeRecipe || postFilters.dietaryPreferences.length > 0;
      case 'users':
        return userFilters.username || userFilters.cookingRole || userFilters.group || userFilters.name;
      case 'groups':
        return groupFilters.name || groupFilters.description;
      default:
        return false;
    }
  })();
  return (
    <div className="advanced-search-overlay">
      <div className="advanced-search-modal">
        {/* Header */}
        <div className="advanced-search-header">
          <h2 className="advanced-search-title">Advanced Search</h2>
          <button
            onClick={onClose}
            className="advanced-search-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="advanced-search-content">
          {/* Search Type Toggle */}
          <div className="search-type-toggle">
            <button
              onClick={() => setSearchType('posts')}
              className={`search-type-btn ${searchType === 'posts' ? 'active' : ''}`}
            >
              <FileText size={18} />
              Posts
            </button>
            <button
              onClick={() => setSearchType('users')}
              className={`search-type-btn ${searchType === 'users' ? 'active' : ''}`}
            >
              <User size={18} />
              Users
            </button>
          <button
              onClick={() => setSearchType('groups')}
              className={`search-type-btn ${searchType === 'groups' ? 'active' : ''}`}
            >
              <Users size={18} />
              Groups
            </button>
          </div>

          {/* Main Search Input */}
          <div className="main-search-input">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>

          {/* Filters Toggle */}
          <div className="filters-toggle">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="filters-toggle-btn"
            >
              <Filter size={18} />
              Filters
              <ChevronDown 
                size={16} 
                className={`chevron ${isFilterOpen ? 'rotate' : ''}`}
              />
              {hasActiveFilters && (
                <span className="active-filters-badge">!</span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="reset-filters-btn"
              >
                Reset filters
              </button>
            )}
          </div>

       {/* Filters Content */}
          {isFilterOpen && (
            <div className="filters-content">
              {searchType === 'posts' ? (
                <>
                  {/* Post Filters */}
                  <div className="filter-group">
                    <label className="filter-label">Title</label>
                    <input
                      type="text"
                      placeholder="Search by title..."
                      value={postFilters.title}
                      onChange={(e) => setPostFilters(prev => ({...prev, title: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Kind of Post</label>
                    <select
                      value={postFilters.kindOfPost}
                      onChange={(e) => setPostFilters(prev => ({...prev, kindOfPost: e.target.value}))}
                      className="filter-select"
                    >
                      <option value="">All types</option>
                      {kindOfPostOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Type Recipe</label>
                    <select
                      value={postFilters.typeRecipe}
                      onChange={(e) => setPostFilters(prev => ({...prev, typeRecipe: e.target.value}))}
                      className="filter-select"
                    >
                      <option value="">All recipe types</option>
                      {typeRecipeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Dietary Preferences</label>
                    <div className="checkbox-grid">
                      {dietaryPreferencesOptions.map(preference => (
                        <label key={preference} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={postFilters.dietaryPreferences.includes(preference)}
                            onChange={() => handleDietaryPreferenceChange(preference)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text">{preference}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : searchType === 'users' ? (
                <>
                  {/* User Filters */}
                  <div className="filter-group">
                    <label className="filter-label">Username</label>
                    <input
                      type="text"
                      placeholder="Search by username..."
                      value={userFilters.username}
                      onChange={(e) => setUserFilters(prev => ({...prev, username: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Cooking Role</label>
                    <input
                      type="text"
                      placeholder="Search by cooking role..."
                      value={userFilters.cookingRole}
                      onChange={(e) => setUserFilters(prev => ({...prev, cookingRole: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Group</label>
                    <input
                      type="text"
                      placeholder="Search by group..."
                      value={userFilters.group}
                      onChange={(e) => setUserFilters(prev => ({...prev, group: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Name</label>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={userFilters.name}
                      onChange={(e) => setUserFilters(prev => ({...prev, name: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Group Filters */}
                  <div className="filter-group">
                    <label className="filter-label">Group Name</label>
                    <input
                      type="text"
                      placeholder="Search by group name..."
                      value={groupFilters.name}
                      onChange={(e) => setGroupFilters(prev => ({...prev, name: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Description</label>
                    <input
                      type="text"
                      placeholder="Search in description..."
                      value={groupFilters.description}
                      onChange={(e) => setGroupFilters(prev => ({...prev, description: e.target.value}))}
                      className="filter-input"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleSearch}
              className="search-btn"
            >
              Search
            </button>
            <button
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;