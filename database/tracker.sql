-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2025 at 09:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `document_type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `document_type`) VALUES
(1, 'Disbursement Voucher'),
(2, 'Official Receipt'),
(3, 'Financial Reports (Accounting)'),
(4, 'Externally Funded Projects (Monthly/Yearly)'),
(5, 'Externally Funded Projects (Terminal Report)'),
(6, 'Legal Matters - Answer to Suspension'),
(7, 'Legal Matters - Appeal Memo'),
(8, 'Legal Matters - Ombudsman'),
(9, 'Request - Write Off'),
(10, 'Request - Others'),
(11, 'Request - Documents'),
(12, 'Contracts for Review'),
(13, 'Contracts for Inspection'),
(14, 'Purchase Order'),
(15, 'Notice of Delivery'),
(16, 'Communications'),
(17, 'Reports - Others'),
(18, 'JEV - (Adjusting/GJ)'),
(19, 'Complaints'),
(20, 'Request for Relief'),
(21, 'AOM Release'),
(22, 'Notice of Suspension'),
(23, 'Notice of Disallowance'),
(24, 'Notice of Charge'),
(25, 'Answer to Appeal'),
(26, 'Answer to Complaints'),
(27, 'Compliance with Ombudsman'),
(28, 'Answer to Complaints'),
(29, 'Auditor Rejoinder'),
(30, 'Audit Query'),
(31, 'Request for Relief Answer');

-- --------------------------------------------------------

--
-- Table structure for table `incoming`
--

CREATE TABLE `incoming` (
  `id` int(11) NOT NULL,
  `controlNo` varchar(255) NOT NULL,
  `dateReceived` date NOT NULL DEFAULT curdate(),
  `dateOfAda` date NOT NULL,
  `adaNo` varchar(255) NOT NULL,
  `jevNo` varchar(255) NOT NULL,
  `orNo` varchar(50) DEFAULT NULL,
  `poNo` varchar(50) DEFAULT NULL,
  `description` text NOT NULL,
  `particulars` text DEFAULT NULL,
  `qty` text DEFAULT NULL,
  `amount` text DEFAULT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `payee` varchar(255) NOT NULL,
  `natureOfPayment` varchar(255) DEFAULT NULL,
  `agency` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `storageFile` varchar(255) NOT NULL,
  `document_type` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `incoming`
--

INSERT INTO `incoming` (`id`, `controlNo`, `dateReceived`, `dateOfAda`, `adaNo`, `jevNo`, `orNo`, `poNo`, `description`, `particulars`, `qty`, `amount`, `totalAmount`, `payee`, `natureOfPayment`, `agency`, `status`, `storageFile`, `document_type`) VALUES
(1, '2025-03-31-001', '2025-03-31', '2025-03-02', 'ADA-001', 'JEV-001', NULL, NULL, 'procurement of the needs and supplies', '[{\"item\":\"headset\",\"quantity\":3,\"amount\":300},\"headset\"]', '[0,382]', '[0,999]', 381618.00, 'Jan Madragan', 'CASH', 'CDO', 'forwarded', 'file', 1),
(8, '2025-03-31-002', '2025-03-31', '2025-03-14', 'JEV-00', 'JEV-00', NULL, NULL, 'dkklwlk', '[\"pen\"]', '[382]', '[100]', 38200.00, 'kllkflk', 'klfklewkl', 'klrlke', 'klflkew', 'lkfkl', 1),
(10, '2025-03-31-003', '2025-03-31', '2025-03-12', 'ADA-003', 'JEV-003', NULL, NULL, 'kdsj', '[\"\"]', '[0]', '[0]', 0.00, 'kjfkje', 'kjrwjk', 'rjkwjk', 'rwkjkj', '', 1),
(13, '2025-04-001', '2025-04-02', '2025-03-30', 'ADA', 'JEV', '', '', 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[213]', '[3232]', 688416.00, 'ustp', 'ustp', 'USTP - Balubal', 'Forwarded to Audit Team Leader', '', 1),
(14, '2025-04-002', '2025-04-02', '2025-03-30', 'ADA-002', 'JEV-002', NULL, NULL, 'procurement', '[\"headset\",\"earphone\"]', '[213,382]', '[3232,999]', 1070034.00, 'ustp', 'ustp', 'USTP - Balubal', 'Forwarded to Audit Team Leader', '', 1),
(15, '2025-04-003', '2025-04-02', '2025-04-16', 'ADA-002', 'JEV-002', NULL, NULL, 'procurement', '[\"headset\",\"pen\"]', '[214,382]', '[3232,999]', 1073266.00, 'ustp', 'ustp', 'USTP - Oroquieta', 'Returned to Agency', '', 1),
(16, '2025-04-004', '2025-04-02', '2025-04-02', 'ADA', 'JEV', '', '', 'procurement', '[\"headset\",\"pen\"]', '[213,382]', '[3232,999]', 1070034.00, 'ustp', 'ustp', 'USTP - Cagayan de Oro', 'Received', 'hi', 1),
(17, '2025-04-005', '2025-04-02', '2025-04-24', 'ADA-005', 'JEV-005', '', '', 'procurement', '[\"headset\",\"headset\"]', '[213,1232]', '[3232,32]', 727840.00, 'ustp', 'ustp', 'USTP - Balubal', 'Received', 'hi', 1),
(18, '2025-04-006', '2025-04-02', '2025-04-08', 'ADA', 'JEV', '', '', 'procurement', '[\"headset\"]', '[213]', '[3232]', 688416.00, 'ustp', 'ustp', 'USTP - Balubal', 'Received', '', 1),
(19, '2025-04-007', '2025-04-02', '2025-04-04', 'ADA', 'JEV', '', '', 'procurement', '[\"headset\"]', '[382]', '[999]', 381618.00, 'ustp', 'ustp', 'USTP - Panaon', 'Received', '', 1),
(20, '2025-04-008', '2025-04-02', '2025-04-23', 'ADA', 'JEV', '', '', 'procurement', '[\"pen\"]', '[382]', '[999]', 381618.00, 'ustp', 'ustp', 'USTP - Balubal', 'Returned to Agency', '', 1),
(21, '2025-04-009', '2025-04-02', '2025-03-30', 'ADA', 'JEV', '', '', 'procurement', '[\"headset\"]', '[213]', '[3232]', 688416.00, 'ustp', 'ustp', 'USTP - Jasaan', 'Received', '', 1),
(22, '2025-04-010', '2025-04-02', '2025-04-12', 'ADA', 'JEV', '', '', 'procurement', '[\"headset\",\"headset\"]', '[1231,382]', '[3232,999]', 4360210.00, 'ustp', 'ustp', 'USTP - Jasaan', 'Forwarded to Audit Team Leader', '', 1),
(23, '2025-04-011', '2025-04-02', '2025-03-30', 'ADA', 'JEV', '', '', 'procurement', '[\"headset\",\"headset\"]', '[1231,213]', '[3232,3232]', 4667008.00, 'ustp', 'ustp', 'USTP - Jasaan', 'Received', '', 1),
(24, '2025-04-012', '2025-04-02', '2025-03-30', 'ADA', 'JEV', '', '', 'procurement', '[\"headset\",\"headset\"]', '[213,213]', '[3232,3232]', 1376832.00, 'ustp', 'ustp', 'USTP - Panaon', 'Forwarded to Audit Team Leader', '', 1),
(32, '2025-04-015', '2025-04-10', '2025-04-02', '', '', 'P.O-200', '', 'procument of the deeds', '[\"headset\"]', '[213]', '[3232]', 688416.00, 'Kent', 'pake mo', 'USTP - Alubijid', 'Returned to Agency', '', 2),
(33, '2025-04-016', '2025-04-10', '2025-04-01', '', '', '', 'PO-001', '', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', '', 'USTP - Villanueva', 'Forwarded to Audit Team Leader', '', 14),
(34, '2025-04-017', '2025-04-10', '2025-03-31', '', '', 'P.O-201', '', 'procument of the food', '[\"headset\"]', '[213]', '[3232]', 688416.00, 'Kent', '', 'USTP - Alubijid', 'Forwarded to Audit Team Leader', '31i93', 2),
(39, '2025-04-018', '2025-04-23', '2025-04-07', '121', '32787', '', '', '', '[\"headset\",\"headset\"]', '[213,0]', '[3232,0]', 688416.00, '', '', 'USTP - Jasaan', 'Forwarded to Audit Team Leader', 'hi', 1),
(42, '2025-04-019', '2025-04-25', '2025-04-03', '', '', '', '', 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[213]', '[3232]', 688416.00, '212', '21', 'USTP - Alubijid', 'Forwarded to ATL', '31i93', 3),
(47, '2025-04-020', '2025-04-25', '2025-04-11', '', '', '', '', 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[213]', '[3232]', 688416.00, '212', '21', '', '', '31i93', 9),
(49, '2025-04-022', '2025-04-25', '0000-00-00', '', '', '', '', 'Created AOM Release with Control No. 2025-04-014', '[]', '[]', '[]', 0.00, '', '', '', '', '', 21),
(50, '2025-04-023', '2025-04-25', '0000-00-00', '', '', '', '', 'Deleted AOM Release (Control No. 2025-04-014)', '[]', '[]', '[]', 0.00, '', '', '', '', '', 21),
(51, '2025-04-024', '2025-04-25', '0000-00-00', '', '', '', '', 'Deleted AOM Release (Control No. 2025-04-007)', '[]', '[]', '[]', 0.00, '', '', '', '', '', 21),
(52, '2025-04-025', '2025-04-25', '2025-04-04', '', '', '', '', '', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', '', 'USTP - Jasaan', '', '', 14),
(53, '2025-04-026', '2025-04-25', '2025-04-03', 'ADA-1001', '', '', '', 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[213]', '[3232]', 688416.00, '212', '21', 'USTP - Balubal', 'Received', '31i93', 12),
(55, '2025-04-027', '2025-04-25', '2025-04-02', '', '', 'P.O-200', '', '', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', '', '', '', '', 2),
(56, '2025-04-028', '2025-04-28', '2025-04-11', 'dasdas', '11221', '', '', '', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', '', '', 'Returned to Agency', '', 1),
(57, '2025-04-029', '2025-04-28', '2025-03-31', '121', '', '', '', '', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', '', 'USTP - Jasaan', 'Forwarded to ATL', 'hi', 1);

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `log_id` varchar(50) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `action` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `user` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`id`, `log_id`, `timestamp`, `action`, `description`, `user`) VALUES
(105, 'LOG_001_2025-04-29', '2025-04-29 02:23:42', 'UPDATE', 'Updated AOM Release (2025-04-015): receivedBy: hi → hello [Particulars Updated]', 'Kent Yagong'),
(106, 'LOG_002_2025-04-29', '2025-04-29 02:24:06', 'CREATE', 'Created AOM Release with Control No. 2025-04-016', 'Kent Yagong'),
(107, 'LOG_003_2025-04-29', '2025-04-29 02:24:27', 'UPDATE', 'Updated AOM Release (2025-04-016): description: 1212 → hiposos [Particulars Updated]', 'Djsajdkhaoi Jehwrhhi'),
(108, 'LOG_004_2025-04-29', '2025-04-29 02:36:52', 'UPDATE', 'Updated AOM Release (2025-04-016): storageFile: hi → hello [Particulars Updated]', 'Kent Yagong'),
(109, 'LOG_005_2025-04-29', '2025-04-29 02:50:00', 'UPDATE', 'Updated AOM Release (2025-04-016): storageFile: hello → hi [Particulars Updated]', 'Kent Yagong'),
(110, 'LOG_006_2025-04-29', '2025-04-29 03:03:00', 'UPDATE', 'Updated Disbursement Voucher (2025-04-005): storageFile: hi → hello [Particulars Updated]', 'System'),
(111, 'LOG_007_2025-04-29', '2025-04-29 03:05:17', 'UPDATE', 'Updated Disbursement Voucher (2025-04-004): storageFile:  → hi [Particulars Updated]', 'System'),
(112, 'LOG_008_2025-04-29', '2025-04-29 03:14:09', 'UPDATE', 'Updated Disbursement Voucher (2025-04-005): storageFile: hello → hi [Particulars Updated]', 'Kent Yagong'),
(113, 'LOG_009_2025-04-29', '2025-04-29 03:14:33', 'UPDATE', 'Updated Disbursement Voucher (2025-04-005): jevNo: JEV-001 → JEV-005 [Particulars Updated]', 'Kent Yagong');

-- --------------------------------------------------------

--
-- Table structure for table `outgoing`
--

CREATE TABLE `outgoing` (
  `id` int(11) NOT NULL,
  `controlNo` varchar(20) NOT NULL,
  `dateReleased` date NOT NULL,
  `document_type` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `particulars` text DEFAULT NULL,
  `qty` text DEFAULT NULL,
  `amount` text DEFAULT NULL,
  `totalAmount` decimal(10,2) DEFAULT 0.00,
  `agency` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `receivedBy` varchar(255) DEFAULT NULL,
  `storageFile` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `outgoing`
--

INSERT INTO `outgoing` (`id`, `controlNo`, `dateReleased`, `document_type`, `description`, `particulars`, `qty`, `amount`, `totalAmount`, `agency`, `status`, `receivedBy`, `storageFile`) VALUES
(1, '2025-04-001', '2025-04-23', 21, 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[213]', '[3232]', 688416.00, 'USTP - Alubijid', 'Returned to Claveria', '', 'hahat'),
(4, '2025-04-002', '2025-04-24', 21, 'hi', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', 'Returned to CPSC', 'hello', 'hi'),
(13, '2025-04-008', '2025-04-24', 23, 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[382]', '[3233]', 1235006.00, '', '', 'Kent Yagong', '31i93'),
(26, '2025-04-013', '2025-04-25', 23, '1212', '[\"headset\"]', '[213]', '[3231]', 688203.00, 'USTP - Alubijid', 'Returned to CPSC', 'Kent Yagong', 'hi'),
(28, '2025-04-014', '2025-04-25', 25, 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', 'Returned to CDO', '', ''),
(29, '2025-04-015', '2025-04-29', 21, 'procurement of the sales tax evation of thksdk;askkl; k;k;aslfsafl kl;l;fsal;flkaslfalsfl;sakl l;sfl;aslf;as;lfl;', '[\"headset\"]', '[213]', '[3232]', 688416.00, 'USTP - Balubal', 'Returned to Claveria', 'hello', 'hi'),
(30, '2025-04-016', '2025-04-29', 21, 'hiposos', '[\"headset\"]', '[213]', '[3232]', 688416.00, '', 'Returned to CPSC', 'Kent Yagong', 'hi');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `id_number` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('intern','staff','audit team leader','audit team member','admin') NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `id_number`, `password`, `role`, `first_name`, `middle_name`, `last_name`, `address`, `email`, `created_at`, `updated_at`) VALUES
(35, '2021301305', '$2y$10$EBhCxZ0f2p.S4.CAraA5fOKai6a4APBml2TWZZHsdV4.NPDjYb.6S', 'admin', 'Kent', '', 'Yagong', 'Zone 8, Cugman, Cagayan De Oro City', 'yagongkent@gmail.com', '2025-04-28 00:52:57', '2025-04-29 05:54:02'),
(37, '2021301306', '$2y$10$bnLNTosERb830Qz5OdioTOGkGsdB1BOSyYCPwzz0nXdXz5sTkOuDW', 'audit team leader', 'Jennica', '', 'Madela', '', 'jrsmadela@gmail.com', '2025-04-29 06:06:04', '2025-04-29 06:06:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `incoming`
--
ALTER TABLE `incoming`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_document_type` (`document_type`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `log_id` (`log_id`),
  ADD KEY `log_id_2` (`log_id`),
  ADD KEY `timestamp` (`timestamp`),
  ADD KEY `action` (`action`),
  ADD KEY `user` (`user`);

--
-- Indexes for table `outgoing`
--
ALTER TABLE `outgoing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_type` (`document_type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `incoming`
--
ALTER TABLE `incoming`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `outgoing`
--
ALTER TABLE `outgoing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `incoming`
--
ALTER TABLE `incoming`
  ADD CONSTRAINT `fk_document_type` FOREIGN KEY (`document_type`) REFERENCES `documents` (`id`);

--
-- Constraints for table `outgoing`
--
ALTER TABLE `outgoing`
  ADD CONSTRAINT `outgoing_ibfk_1` FOREIGN KEY (`document_type`) REFERENCES `documents` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
