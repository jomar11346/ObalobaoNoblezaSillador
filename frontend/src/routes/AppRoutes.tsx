import { Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import FloatingLabelInput from "../components/Input/FloatingLabelInput";
import { useState } from "react";
import FloatingLabelSelect from "../components/Select/FloatingLabelSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/Table";

const SampleComponent = () => {
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [birthDate, setBirthDate] = useState("");
const [password, setPassword] = useState("");
const [gender, setGender] = useState("");

 const genders = [
   {
     value: "",
     text: "Select Gender"},
   {
     value: 1,
     text: "Male",
    },
   {
     value: 2,
     text: "Female",
   },
   {
     value: 3,
     text: "Prefer not to say",
   }
  ];

  const genderLabel =
    genders.find((g) => String(g.value) === gender)?.text ?? "";

  return (
    <>
    <h1 className="text-red-600">Hello World</h1>
    <div className="mb-4">

     <FloatingLabelInput label="First Name"
      type="text"
      name="first_name"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      required
      autoFocus
   />
   <p className="font-medium">First Name: {firstName}</p>

    </div>
    <div className="mb-4">
     <FloatingLabelInput label="Last Name"
      type="text"
      name="last_name"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      required
   />
   <p className="font-medium">Last Name: {lastName}</p>

    </div>
    <div className="mb-4">
     <FloatingLabelInput label="Birth Date"
      type="date" 
      name="birth_date"
      value={birthDate}
      onChange={(e) => setBirthDate(e.target.value)}
   />
   <p className="font-medium">Birth Date: {birthDate}</p>

    </div>
    <div className="mb-4">
     <FloatingLabelInput label="Password" 
      type="password"
      name="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
   />
   <p className="font-medium">Password: {password}</p>

    </div>
    <div className="mb-4">
      <FloatingLabelSelect label="Gender"
      name="gender"
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      >
        {genders.map((opt, index) => (
          <option value={opt.value} key={index}>
            {opt.text}
          </option>
        ))}
      </FloatingLabelSelect>
      <p className="mt-4 font-bold text-gray-900">
        Gender: {genderLabel || "—"}
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table className="w-full text-center">
            <TableHeader>
              <TableRow className="bg-[#1a66ff]">
                <TableCell
                  isHeader
                  className="px-4 py-3 text-center text-sm font-bold text-white"
                >
                  No.
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Gender
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {genders.map((gender, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {gender.value}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {gender.text}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
    </>
  );
};


const AppRoutes = () => {
  return (
      <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<SampleComponent />} />
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;