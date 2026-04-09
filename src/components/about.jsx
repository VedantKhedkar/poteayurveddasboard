"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  CalendarCheck,
  BarChart2,
  Users,
  Target,
  Trophy,
  GraduationCap,
  Award,
  Building2,
  School,
  BookText,
  CheckCircle,
  Monitor,
  Book,
  Library,
  Smartphone,
  UserCheck,
  ClipboardList,
  Star,
  Plus,
  X,
  Save,
  Trash2,
} from "lucide-react";

const AdminAboutDashboard = () => {
  // Initial data states
  const [vision, setVision] = useState(
    "“महाराष्ट्रातील उमेदवारांचे निवड प्रमाण वाढवणे” हे आमचे मुख्य उद्दिष्ट आहे. महाराष्ट्रातील ग्रामीण व शहरी भागातील विद्यार्थ्यांना दर्जेदार व अत्याधुनिक मार्गदर्शन प्रदान करून अधिकाधिक विद्यार्थी यशस्वी व्हावेत यासाठी आम्ही कटिबद्ध आहोत."
  );

  const [missionPoints, setMissionPoints] = useState([
    {
      id: 1,
      icon: BookOpen,
      title: "गुणवत्तापूर्ण अध्यापन",
      description: "अत्याधुनिक शिक्षण पद्धती व अनुभवी शिक्षक",
    },
    {
      id: 2,
      icon: User,
      title: "वैयक्तिक लक्ष देणारे मार्गदर्शन",
      description: "प्रत्येक विद्यार्थ्याला वैयक्तिक लक्ष",
    },
    {
      id: 3,
      icon: CalendarCheck,
      title: "अद्ययावत अभ्यासक्रम",
      description: "सद्य परीक्षा पद्धतीनुसार अद्ययावत अभ्यासक्रम",
    },
    {
      id: 4,
      icon: BarChart2,
      title: "सतत टेस्ट सिरीज व प्रगतीमूल्यांकन",
      description: "नियमित मूल्यमापन व प्रगती अहवाल",
    },
    {
      id: 5,
      icon: Users,
      title: "राज्य, राष्ट्रीय स्तरावरील तज्ञांची सत्रे",
      description: "राज्य व राष्ट्रीय स्तरावरील तज्ञांचे मार्गदर्शन",
    },
  ]);

  const [aboutContent, setAboutContent] = useState({
    main: "पी.आर.पोटे पाटील एज्युकेशनल ग्रुप ही एक अग्रणी निवासी कौशल्य विकास संस्था आहे जी २००८ मध्ये माननीय प्रवीणजी पोटे पाटील यांनी सुरू केली होती. आज संस्थेची अभियांत्रिकी, प्रबंधन, आर्किटेक्चर, कृषि, आयुर्वेद, शिक्षण व इतर या सर्वच क्षेत्रात विद्यादानाचे कार्य अतिशय प्रामाणिकपणे व विश्वासाने सुरू आहे. यात भर म्हणून आता आम्ही उत्तम प्रशासकीय अधिकारी घडविण्यासाठी व शासकीय नोकरी मिळण्यासाठी धडपड करणाऱ्या तरुणाईला मदत, मार्गदर्शन व प्रशिक्षण देण्यासाठी पी. आर. पोटे पाटील लक्ष्य अकॅडेमी फॉर UPSC / MPSC & Competitive exams ची स्थापना करीत आहोत.",
    points: [
      "१००+ सामाजिक प्रभाव संस्थांच्या वाढीला चालना देण्यासाठी कुशल मानवी संसाधनांच्या तीव्र गरजेतून याचा जन्म झाला.",
      "ग्रामीण आणि शहरी तरुण, प्राथमिक शाळेपासून ते पीएच.डी. पर्यंतचे शिक्षण घेतात आणि सध्या जागतिक अर्थव्यवस्थेत समाजासाठी मागणी असलेल्या आवश्यक व्यावहारिक कौशल्यांनी सुसज्ज आहेत.",
    ],
  });

  const [facilityDetails, setFacilityDetails] = useState([
    {
      id: 1,
      icon: BookOpen,
      title: "अनुभवी शिक्षक",
      description:
        "संस्थेमध्ये डॉ. प्रिती राऊत आणि सुमित तट्टे यांच्यासारखे अनुभवी आणि तज्ञ शिक्षक आहेत, जे आपापल्या विषयात पारंगत आहेत. त्यांच्या सोप्या आणि प्रभावी शिकवण्याच्या पद्धतीमुळे विद्यार्थ्यांना अवघड संकल्पना सहज समजतात.",
    },
    {
      id: 2,
      icon: User,
      title: "सर्वसमावेशक अभ्यासक्रम",
      description:
        "येथे राज्यसेवा, संयुक्त गट ब आणि गट क, तसेच इतर स्पर्धा परीक्षांसाठी (उदा. SSC CGL, CTET, IAS) सविस्तर आणि परीक्षाभिमुख मार्गदर्शन केले जाते.",
    },
    {
      id: 3,
      icon: CalendarCheck,
      title: "अद्ययावत अभ्यास साहित्य",
      description:
        "विद्यार्थ्यांना अद्ययावत आणि परीक्षेच्या बदलत्या स्वरूपानुसार तयार केलेले अभ्यास साहित्य पुरवले जाते.",
    },
    {
      id: 4,
      icon: BarChart2,
      title: "सराव परीक्षा आणि विश्लेषण",
      description:
        "नियमित सराव परीक्षा (टेस्ट सिरीज) घेतल्या जातात आणि त्या विश्लेषणासह विद्यार्थ्यांच्या चुका सुधारण्यावर भर दिला जातो.",
    },
    {
      id: 5,
      icon: Users,
      title: "वैयक्तिक मार्गदर्शन",
      description:
        "प्रत्येक विद्यार्थ्याच्या प्रगतीकडे वैयक्तिक लक्ष दिले जाते आणि आवश्यकतेनुसार त्यांना मार्गदर्शन केले जाते.",
    },
    {
      id: 6,
      icon: Users,
      title: "डिजिटल लर्निंग प्लॅटफॉर्म",
      description:
        "संस्थेचे स्वतःचे युट्यूब चॅनल आणि ऍप आहे, ज्यावर विविध विषयांवरील व्हिडिओ लेक्चर्स, चालू घडामोडींचे विश्लेषण आणि इतर उपयुक्त माहिती उपलब्ध असते.",
    },
  ]);

  const [facilities, setFacilities] = useState([
    { id: 1, icon: Monitor, title: "सुसज्ज डिजिटल क्लासरूम" },
    { id: 2, icon: Library, title: "लायब्ररी व अभ्यासिका" },
    { id: 3, icon: UserCheck, title: "तज्ञ मार्गदर्शक" },
    { id: 4, icon: ClipboardList, title: "कॅरियर अॅप्टिट्यूड टेस्ट" },
    { id: 5, icon: Book, title: "अद्ययावत नोट्स" },
    { id: 6, icon: Smartphone, title: "ऑफलाइन & ऑनलाइन सुविधा" },
  ]);

  const [studentFeedback, setStudentFeedback] = useState(
    "'Justdial' सारख्या प्लॅटफॉर्मवर MPSC लक्ष्य क्लासेसला 4.8/5 असे उत्कृष्ट रेटिंग मिळाले आहे, जे विद्यार्थ्यांच्या समाधानाचे आणि संस्थेच्या गुणवत्तेचे द्योतक आहे. अनेक यशस्वी विद्यार्थ्यांनी आपल्या यशाचे श्रेय लक्ष्य क्लासेसच्या मार्गदर्शनाला दिले आहे. अमरावती आणि परिसरातील MPSC आणि इतर स्पर्धा परीक्षांची तयारी करणाऱ्या विद्यार्थ्यांसाठी 'MPSC लक्ष्य क्लासेस' हा एक अत्यंत विश्वासार्ह आणि प्रभावी पर्याय आहे."
  );

  const [examPreparation, setExamPreparation] = useState([
    "MPSC राज्यसेवा (पूर्व + मुख्य + मुलाखत)",
    "MPSC संयुक्त गट 'ब' आणि गट 'क' (पूर्व + मुख्य)",
    "पोलीस भरती",
    "सरळसेवा भरती",
    "IAS (UPSC)",
    "बँकिंग परीक्षा",
  ]);

  const [collaborationText, setCollaborationText] = useState(
    "P.R.Pote Patil educational group च्या माध्यमातून विविध क्षेत्रात करिअर घडविल्यानंतर स्पर्धा परीक्षांच्या माध्यमातून शासकीय नोकरी मिळविण्यासाठी संपूर्ण मदत, मार्गदर्शन व करिअर डिझाईन सुविधा देणारी एकमेव संस्था . तर आता पी. आर. पोटे पाटील एड्युकेशनल ग्रुप व MPSC लक्ष्य क्लासेस च्या संयुक्त विद्यमाने स्पर्धा परीक्षांची तयारी करणाऱ्या विद्यार्थ्यांसाठी उत्तम प्रशिक्षण संस्था म्हणून P. R. Pote Patil Lakshya Academy For UPSC, MPSC & Competitive Exams ची स्थापना करण्यात आली आहे."
  );

  // Form states
  const [newMissionPoint, setNewMissionPoint] = useState({
    title: "",
    description: "",
  });
  const [newFacilityDetail, setNewFacilityDetail] = useState({
    title: "",
    description: "",
  });
  const [newFacility, setNewFacility] = useState({ title: "" });
  const [newExam, setNewExam] = useState("");

  // Handlers
  const handleAddMissionPoint = () => {
    if (newMissionPoint.title && newMissionPoint.description) {
      setMissionPoints([
        ...missionPoints,
        {
          id: Date.now(),
          icon: BookOpen,
          title: newMissionPoint.title,
          description: newMissionPoint.description,
        },
      ]);
      setNewMissionPoint({ title: "", description: "" });
    }
  };

  const handleDeleteMissionPoint = (id) => {
    setMissionPoints(missionPoints.filter((point) => point.id !== id));
  };

  const handleAddFacilityDetail = () => {
    if (newFacilityDetail.title && newFacilityDetail.description) {
      setFacilityDetails([
        ...facilityDetails,
        {
          id: Date.now(),
          icon: BookOpen,
          title: newFacilityDetail.title,
          description: newFacilityDetail.description,
        },
      ]);
      setNewFacilityDetail({ title: "", description: "" });
    }
  };

  const handleDeleteFacilityDetail = (id) => {
    setFacilityDetails(facilityDetails.filter((item) => item.id !== id));
  };

  const handleAddFacility = () => {
    if (newFacility.title) {
      setFacilities([
        ...facilities,
        { id: Date.now(), icon: Monitor, title: newFacility.title },
      ]);
      setNewFacility({ title: "" });
    }
  };

  const handleDeleteFacility = (id) => {
    setFacilities(facilities.filter((item) => item.id !== id));
  };

  const handleAddExam = () => {
    if (newExam) {
      setExamPreparation([...examPreparation, newExam]);
      setNewExam("");
    }
  };

  const handleDeleteExam = (index) => {
    setExamPreparation(examPreparation.filter((_, i) => i !== index));
  };

  const handleUpdatePoint = (index, newValue) => {
    const updatedPoints = [...aboutContent.points];
    updatedPoints[index] = newValue;
    setAboutContent({ ...aboutContent, points: updatedPoints });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">About Us Dashboard</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
            <Save className="mr-2" /> Save All Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vision Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <Target className="mr-2" /> Vision
            </h2>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg mb-4"
            />
          </div>

          {/* About Content */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <Building2 className="mr-2" /> About Content
            </h2>
            <textarea
              value={aboutContent.main}
              onChange={(e) => setAboutContent({ ...aboutContent, main: e.target.value })}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg mb-4"
            />
            
            <h3 className="font-semibold mb-2">Key Points:</h3>
            {aboutContent.points.map((point, index) => (
              <div key={index} className="flex items-center mb-2">
                <textarea
                  value={point}
                  onChange={(e) => handleUpdatePoint(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg mr-2"
                />
                <button 
                  onClick={() => {
                    const updatedPoints = aboutContent.points.filter((_, i) => i !== index);
                    setAboutContent({ ...aboutContent, points: updatedPoints });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setAboutContent({ 
                ...aboutContent, 
                points: [...aboutContent.points, ""] 
              })}
              className="flex items-center text-blue-500 mt-2"
            >
              <Plus size={16} className="mr-1" /> Add Point
            </button>
          </div>

          {/* Mission Points */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <Trophy className="mr-2" /> Mission Points
            </h2>
            
            <div className="space-y-4">
              {missionPoints.map((point) => (
                <div key={point.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      type="text"
                      value={point.title}
                      onChange={(e) => {
                        const updatedPoints = missionPoints.map(p => 
                          p.id === point.id ? { ...p, title: e.target.value } : p
                        );
                        setMissionPoints(updatedPoints);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg mb-2 font-medium"
                    />
                    <button 
                      onClick={() => handleDeleteMissionPoint(point.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <textarea
                    value={point.description}
                    onChange={(e) => {
                      const updatedPoints = missionPoints.map(p => 
                        p.id === point.id ? { ...p, description: e.target.value } : p
                      );
                      setMissionPoints(updatedPoints);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Add New Mission Point</h3>
              <input
                type="text"
                value={newMissionPoint.title}
                onChange={(e) => setNewMissionPoint({...newMissionPoint, title: e.target.value})}
                placeholder="Title"
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              />
              <textarea
                value={newMissionPoint.description}
                onChange={(e) => setNewMissionPoint({...newMissionPoint, description: e.target.value})}
                placeholder="Description"
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              />
              <button 
                onClick={handleAddMissionPoint}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="mr-2" /> Add Point
              </button>
            </div>
          </div>

          {/* Facility Details */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <Users className="mr-2" /> Facility Details
            </h2>
            
            <div className="space-y-4">
              {facilityDetails.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updatedItems = facilityDetails.map(i => 
                          i.id === item.id ? { ...i, title: e.target.value } : i
                        );
                        setFacilityDetails(updatedItems);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg mb-2 font-medium"
                    />
                    <button 
                      onClick={() => handleDeleteFacilityDetail(item.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(e) => {
                      const updatedItems = facilityDetails.map(i => 
                        i.id === item.id ? { ...i, description: e.target.value } : i
                      );
                      setFacilityDetails(updatedItems);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Add New Facility Detail</h3>
              <input
                type="text"
                value={newFacilityDetail.title}
                onChange={(e) => setNewFacilityDetail({...newFacilityDetail, title: e.target.value})}
                placeholder="Title"
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              />
              <textarea
                value={newFacilityDetail.description}
                onChange={(e) => setNewFacilityDetail({...newFacilityDetail, description: e.target.value})}
                placeholder="Description"
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              />
              <button 
                onClick={handleAddFacilityDetail}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="mr-2" /> Add Detail
              </button>
            </div>
          </div>

          {/* Facilities List */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <Library className="mr-2" /> Facilities List
            </h2>
            
            <div className="space-y-2">
              {facilities.map((item) => (
                <div key={item.id} className="flex items-center border border-gray-200 rounded-lg p-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updatedItems = facilities.map(i => 
                        i.id === item.id ? { ...i, title: e.target.value } : i
                      );
                      setFacilities(updatedItems);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <button 
                    onClick={() => handleDeleteFacility(item.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex">
              <input
                type="text"
                value={newFacility.title}
                onChange={(e) => setNewFacility({...newFacility, title: e.target.value})}
                placeholder="New facility"
                className="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
              />
              <button 
                onClick={handleAddFacility}
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Exam Preparation */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <GraduationCap className="mr-2" /> Exam Preparation
            </h2>
            
            <div className="space-y-2">
              {examPreparation.map((exam, index) => (
                <div key={index} className="flex items-center border border-gray-200 rounded-lg p-3">
                  <input
                    type="text"
                    value={exam}
                    onChange={(e) => {
                      const updatedExams = [...examPreparation];
                      updatedExams[index] = e.target.value;
                      setExamPreparation(updatedExams);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <button 
                    onClick={() => handleDeleteExam(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex">
              <input
                type="text"
                value={newExam}
                onChange={(e) => setNewExam(e.target.value)}
                placeholder="New exam type"
                className="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
              />
              <button 
                onClick={handleAddExam}
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Student Feedback */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <Star className="mr-2" /> Student Feedback
            </h2>
            <textarea
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Collaboration Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
              <Users className="mr-2" /> Collaboration Content
            </h2>
            <textarea
              value={collaborationText}
              onChange={(e) => setCollaborationText(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAboutDashboard;