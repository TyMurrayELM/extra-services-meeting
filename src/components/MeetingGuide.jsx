import React from 'react';
import { supabase } from '../lib/supabase';

const MeetingGuide = ({
  meetingData,
  currentBooks,
  setCurrentBooks,
  handleBookChange,
  handleAddBook,
  facilitator,
  setFacilitator,
  handleFacilitatorChange,
  uploadedFiles,
  handleFileUpload,
  selectedDate,
}) => {
  return (
    <div className="space-y-4 mt-6">
      {/* First Section: Mission & Current Readings */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <div className="bg-blue-900 p-4">
          <h2 className="text-white text-lg font-semibold">Mission & Current Readings</h2>
        </div>
        <div className="bg-white p-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Mission</h3>
            <p>{meetingData.mission}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Current Book Readings</h3>
            <div className="space-y-2">
              {currentBooks.map((book, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>📚</span>
                  <input
                    type="text"
                    value={book || ''}
                    onChange={(e) => {
                      const newBooks = [...currentBooks];
                      newBooks[index] = e.target.value;
                      setCurrentBooks(newBooks);
                      handleBookChange(index, e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:rounded-md focus:outline-none"
                    placeholder="Enter book title..."
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  setCurrentBooks(prev => [...prev, '']);
                  handleAddBook();
                }}
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                + Add book
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section: Meeting Agenda & Facilitation */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <div className="bg-blue-900 p-4">
          <h2 className="text-white text-lg font-semibold">Meeting Agenda & Facilitation</h2>
        </div>
        <div className="bg-white p-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Facilitator</h3>
                <input
                  type="text"
                  value={facilitator}
                  onChange={(e) => {
                    setFacilitator(e.target.value);
                    handleFacilitatorChange(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:rounded-md focus:outline-none"
                  placeholder="Enter facilitator name..."
                />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Group Rules of Engagement</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Confidentiality</li>
                  <li>Be present (cell phones and laptops away)</li>
                  <li>Come prepared with selected highlights regarding each agenda item</li>
                  <li>Follow procedures</li>
                  <li>Take notes</li>
                  <li>Complete assigned tasks</li>
                  <li>Start and end on time</li>
                  <li>Lift each other up</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Agenda</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span>Check-In</span>
                  <span className="text-sm text-gray-500">5 mins</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Third Section: Meeting Files */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <div className="bg-blue-900 p-4">
          <h2 className="text-white text-lg font-semibold">Meeting Files & Transcripts</h2>
        </div>
        <div className="bg-white p-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('meeting-files').click()}
          >
            <input
              type="file"
              id="meeting-files"
              className="hidden"
              onChange={handleFileUpload}
              multiple
            />
            <div className="flex flex-col items-center">
              <span className="mb-2 text-lg">📁 Upload meeting files or transcripts</span>
              <span className="text-sm text-gray-500">Drop files here or click to upload</span>
            </div>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Uploaded Files:</h3>
              <ul className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>📄</span>
                    <button
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.storage
                            .from('meeting-files')
                            .download(file.path);
                          if (error) throw error;

                          const url = window.URL.createObjectURL(data);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = file.name;
                          document.body.appendChild(link);
                          link.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(link);
                        } catch (error) {
                          console.error('Error downloading file:', error);
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      {file.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingGuide;
